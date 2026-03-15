from django.contrib import admin
from django.urls import path, include
from recipes.views import (
    HealthCheckView, RegisterView, LoginView, MeView,
    BoardListCreateView, BoardDetailView, UserProfileView,
    ConversationListView, ConversationDetailView,
    UserSearchView, TrackerView, TrackerDeleteView,
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
    # User profiles
    path('api/users/<int:pk>/', UserProfileView.as_view(), name='user-profile'),
    path('api/users/search/', UserSearchView.as_view(), name='user-search'),
    # Chat
    path('api/chat/', ConversationListView.as_view(), name='chat-list'),
    path('api/chat/<int:pk>/', ConversationDetailView.as_view(), name='chat-detail'),
    # Tracker
    path('api/tracker/', TrackerView.as_view(), name='tracker'),
    path('api/tracker/<int:pk>/', TrackerDeleteView.as_view(), name='tracker-delete'),
    # Health
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
]

