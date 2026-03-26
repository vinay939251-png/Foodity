from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'user_query', 'ai_response', 'is_recipe_generation', 'created_at']
        read_only_fields = ['ai_response', 'created_at']