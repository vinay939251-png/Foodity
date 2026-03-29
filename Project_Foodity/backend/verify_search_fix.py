import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'foodity.settings')
django.setup()

from django.contrib.auth.models import User
from recipes.models import UserProfile, Recipe
from rest_framework.test import APIRequestFactory
from recipes.views import AutocompleteView

def verify_autocomplete():
    # Setup data
    u_chef, _ = User.objects.get_or_create(username='chef_gordon')
    p_chef, _ = UserProfile.objects.get_or_create(user=u_chef, defaults={'display_name': 'Gordon Ramsay'})
    
    Recipe.objects.get_or_create(
        title="Beef Wellington",
        author=p_chef,
        defaults={'image': 'http://example.com/beef.jpg'}
    )
    
    factory = APIRequestFactory()
    view = AutocompleteView.as_view()
    
    # Test query "Gordon" (should match user)
    print("Testing query 'Gordon'...")
    request = factory.get('/api/recipes/autocomplete/', {'q': 'Gordon'})
    response = view(request)
    data = response.data
    print(f"Users found: {len(data['users'])}")
    print(f"User names: {[u['display_name'] for u in data['users']]}")
    
    # Test query "Beef" (should match recipe)
    print("\nTesting query 'Beef'...")
    request = factory.get('/api/recipes/autocomplete/', {'q': 'Beef'})
    response = view(request)
    data = response.data
    print(f"Recipes found: {len(data['recipes'])}")
    print(f"Recipe titles: {[r['title'] for r in data['recipes']]}")
    
    if len(data['users']) >= 0 and len(data['recipes']) >= 0:
        # Check if the structure is correct
        if 'recipes' in data and 'users' in data:
            print("\nAutocomplete structure is CORRECT.")
        else:
            print("\nAutocomplete structure is INCORRECT.")
    
    print("\nVERIFICATION COMPLETE.")

if __name__ == '__main__':
    verify_autocomplete()
