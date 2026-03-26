from django.db import models
from django.conf import settings
from common.models import BaseModel

class ChatMessage(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_chats')
    user_query = models.TextField()
    ai_response = models.TextField()
    is_recipe_generation = models.BooleanField(default=False)

    def __str__(self):
        return f"Chat with {self.user.email} on {self.created_at.date()}"