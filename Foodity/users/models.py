from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    # Everything below here MUST be indented by 4 spaces
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # --- Profile Info ---
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    pronouns = models.CharField(max_length=50, blank=True)
    username_display = models.CharField(max_length=100, unique=True, null=True)
    website = models.URLField(blank=True)
    is_public = models.BooleanField(default=True)

    # --- Account Management ---
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=50, default='English')

    # --- Notifications ---
    notify_comments = models.BooleanField(default=True)
    notify_likes = models.BooleanField(default=True)
    notify_replies = models.BooleanField(default=True)
    notify_messages = models.BooleanField(default=True)

    def __str__(self):
        return self.user.email