import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'foodity.settings')
django.setup()

from recipes.models import Like, UserProfile, Recipe

print("--- Database Debug: Likes ---")
likes = Like.objects.all()
print(f"Total Likes in DB: {likes.count()}")
for l in likes[:10]:
    print(f"User: {l.user.user.username} (ID: {l.user.id}), Recipe: {l.recipe.title} (ID: {l.recipe.id})")

# Check for a specific user if known
# profiles = UserProfile.objects.all()
# for p in profiles:
#     l_count = Like.objects.filter(user=p).count()
#     if l_count > 0:
#         print(f"User {p.user.username} has {l_count} likes.")
