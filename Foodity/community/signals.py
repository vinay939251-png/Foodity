from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Comment, Like

@receiver(post_save, sender=Comment)
def comment_notification(sender, instance, created, **kwargs):
    if created:
        # Check if the recipe author wants to be notified
        author_profile = instance.recipe.author.profile
        if author_profile.notify_comments:
            print(f"NOTIFICATION: {instance.user.username} commented on your recipe!")

@receiver(post_save, sender=Like)
def like_notification(sender, instance, created, **kwargs):
    if created:
        # Check if the author has 'notify_likes' turned on
        author_profile = instance.recipe.author.profile
        if author_profile.notify_likes:
            print(f"NOTIFICATION: {instance.user.username} liked your recipe!")