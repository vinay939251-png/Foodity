from django.contrib import admin
from django.urls import path, include
from recipes.views import (
    HealthCheckView, RegisterView, LoginView, MeView,
    BoardListCreateView, BoardDetailView, BoardCollaboratorsView, UserProfileView,
    ConversationListView, ConversationDetailView,
    UserSearchView, TrackerView, TrackerDeleteView,
    FollowToggleView, FollowersListView, FollowingListView,
    LikedRecipesListView, ThumbnailView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/me/', MeView.as_view(), name='me'),
    # Recipes (includes like, save, comments)
    path('api/recipes/', include('recipes.urls')),
    # Boards
    path('api/boards/', BoardListCreateView.as_view(), name='board-list'),
    path('api/boards/<int:pk>/', BoardDetailView.as_view(), name='board-detail'),
    path('api/boards/<int:pk>/collaborators/', BoardCollaboratorsView.as_view(), name='board-collaborators'),
    # User profiles
    path('api/users/<int:pk>/', UserProfileView.as_view(), name='user-profile'),
    path('api/users/<int:pk>/follow/', FollowToggleView.as_view(), name='user-follow'),
    path('api/users/<int:pk>/followers/', FollowersListView.as_view(), name='user-followers'),
    path('api/users/<int:pk>/following/', FollowingListView.as_view(), name='user-following'),
    path('api/users/<int:pk>/liked/', LikedRecipesListView.as_view(), name='user-liked'),
    path('api/users/search/', UserSearchView.as_view(), name='user-search'),
    # Chat
    path('api/chat/', ConversationListView.as_view(), name='chat-list'),
    path('api/chat/<int:pk>/', ConversationDetailView.as_view(), name='chat-detail'),
    # Tracker
    path('api/tracker/', TrackerView.as_view(), name='tracker'),
    path('api/tracker/<int:pk>/', TrackerDeleteView.as_view(), name='tracker-delete'),
    # Media Thumbnails
    path('api/thumbnail/', ThumbnailView.as_view(), name='thumbnail'),
    # Health
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
]

