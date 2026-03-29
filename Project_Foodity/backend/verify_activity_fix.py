import os
import django
from django.db.models import Q

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'foodity.settings')
django.setup()

from django.contrib.auth.models import User
from recipes.models import UserProfile, Follow, Activity, Recipe

def verify_fix():
    # Setup users
    u_alice, _ = User.objects.get_or_create(username='alice')
    u_bob, _ = User.objects.get_or_create(username='bob')
    u_charlie, _ = User.objects.get_or_create(username='charlie')
    
    p_alice, _ = UserProfile.objects.get_or_create(user=u_alice)
    p_bob, _ = UserProfile.objects.get_or_create(user=u_bob)
    p_charlie, _ = UserProfile.objects.get_or_create(user=u_charlie)
    
    # Setup a recipe for Bob
    recipe_bob, _ = Recipe.objects.get_or_create(
        title="Bob's Special Burger",
        author=p_bob,
        defaults={'image': 'http://example.com/burger.jpg'}
    )
    
    # Clear old data
    Activity.objects.filter(Q(user__in=[p_alice, p_bob, p_charlie]) | Q(target_user__in=[p_alice, p_bob, p_charlie])).delete()
    Follow.objects.filter(follower__in=[p_alice, p_bob, p_charlie]).delete()
    
    print("--- Scenario 1: Alice follows Bob ---")
    Follow.objects.create(follower=p_alice, following=p_bob)
    
    # Check Bob's feed (should see Alice followed him)
    from recipes.views import ActivityFeedView
    from rest_framework.test import APIRequestFactory, force_authenticate
    
    factory = APIRequestFactory()
    view = ActivityFeedView.as_view()
    
    def get_feed(profile):
        request = factory.get('/api/recipes/activity/')
        force_authenticate(request, user=profile.user)
        response = view(request)
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']
        return response.data
    
    bob_feed = get_feed(p_bob)
    print(f"Bob's feed count: {len(bob_feed)}")
    found_follow = any(a['action_type'] == 'followed' and a['user']['id'] == p_alice.id for a in bob_feed)
    print(f"Bob sees Alice followed him: {found_follow}")
    
    print("\n--- Scenario 2: Charlie likes Bob's recipe ---")
    from recipes.models import Like
    Like.objects.filter(user=p_charlie, recipe=recipe_bob).delete()
    Like.objects.create(user=p_charlie, recipe=recipe_bob)
    
    # Bob should see Charlie liked his recipe
    bob_feed = get_feed(p_bob)
    found_like = any(a['action_type'] == 'liked' and a['user']['id'] == p_charlie.id and a.get('target_recipe', {}).get('id') == recipe_bob.id for a in bob_feed)
    print(f"Bob sees Charlie liked his recipe: {found_like}")
    
    # Alice should see Charlie liked Bob's recipe? 
    # Wait, Alice follows Bob, she doesn't follow Charlie.
    # Current logic: followed_user_ids = Alice's following -> [Bob].
    # Alice only sees activities FROM Bob. Charlie's like is FROM Charlie.
    # So Alice won't see it. This is correct for a "Following Feed".
    # But Charlie sees it.
    
    print("\n--- Scenario 3: Bob follows Charlie ---")
    Follow.objects.create(follower=p_bob, following=p_charlie)
    
    # Alice should see Bob followed Charlie
    alice_feed = get_feed(p_alice)
    found_bob_follow = any(a['action_type'] == 'followed' and a['user']['id'] == p_bob.id and a.get('target_user', {}).get('id') == p_charlie.id for a in alice_feed)
    print(f"Alice sees Bob followed Charlie: {found_bob_follow}")
    
    if found_follow and found_like and found_bob_follow:
        print("\nVERIFICATION SUCCESSFUL!")
    else:
        print("\nVERIFICATION FAILED!")

if __name__ == '__main__':
    verify_fix()
