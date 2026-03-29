import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'foodity.settings')
django.setup()

from django.contrib.auth.models import User
from recipes.models import UserProfile, Follow, Activity

def test_following():
    # Setup users
    u1, _ = User.objects.get_or_create(username='test_user1')
    u2, _ = User.objects.get_or_create(username='test_user2')
    
    p1, _ = UserProfile.objects.get_or_create(user=u1)
    p2, _ = UserProfile.objects.get_or_create(user=u2)
    
    print(f"User 1: {p1}, User 2: {p2}")
    
    # Remove existing follows
    Follow.objects.filter(follower=p1, following=p2).delete()
    Activity.objects.filter(user=p1, action_type='followed', target_user=p2).delete()
    
    # test follow
    print("Following user 2...")
    follow = Follow.objects.create(follower=p1, following=p2)
    
    # check activity
    activity = Activity.objects.filter(user=p1, action_type='followed', target_user=p2).first()
    if activity:
        print(f"Activity created: {activity}")
    else:
        print("Error: Activity NOT created!")
        
    # test unfollow
    print("Unfollowing user 2...")
    follow.delete()
    
    # check activity remains
    activity = Activity.objects.filter(user=p1, action_type='followed', target_user=p2).first()
    if activity:
        print(f"Activity still exists (as expected): {activity}")
    else:
        print("Activity deleted (unexpected)?")

if __name__ == '__main__':
    test_following()
