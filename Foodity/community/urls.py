from django.urls import path
from .views import CommentListView, LikeToggleView ,LikedRecipesListView

urlpatterns = [
    path('comments/', CommentListView.as_view(), name='comment-list'),
    path('like/<int:recipe_id>/', LikeToggleView.as_view(), name='like-toggle'),
    path('my-likes/', LikedRecipesListView.as_view(), name='my-likes'),
]