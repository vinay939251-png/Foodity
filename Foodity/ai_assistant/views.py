from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from .services import generate_ai_recipe

class ChatView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatMessage.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user_query = self.request.data.get('user_query')
        ai_response = generate_ai_recipe(user_query)
        serializer.save(user=self.request.user, ai_response=ai_response)