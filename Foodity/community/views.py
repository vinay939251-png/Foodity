from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import Comment, Like
from .serializers import CommentSerializer, LikeSerializer
from recipes.models import Recipe
from recipes.serializers import RecipeSerializer    

class CommentListView(generics.ListCreateAPIView):
    queryset = Comment.objects.filter(parent=None)
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LikeToggleView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, recipe_id):
        like, created = Like.objects.get_or_create(user=request.user, recipe_id=recipe_id)
        if not created:
            like.delete()
            return Response({"message": "Unliked"}, status=status.HTTP_200_OK)
        return Response({"message": "Liked"}, status=status.HTTP_201_CREATED)
class LikedRecipesListView(generics.ListAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Returns only the recipes that the current user has liked
        user = self.request.user
        liked_ids = Like.objects.filter(user=user).values_list('recipe_id', flat=True)
        return Recipe.objects.filter(id__in=liked_ids)