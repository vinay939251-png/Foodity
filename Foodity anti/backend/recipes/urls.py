from django.urls import path
from . import views

app_name = 'recipes'

urlpatterns = [
    # Recipes
    path('', views.RecipeListView.as_view(), name='recipe-list'),
    path('<int:pk>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    path('<int:pk>/like/', views.ToggleLikeView.as_view(), name='toggle-like'),
    path('<int:pk>/save/', views.ToggleSaveView.as_view(), name='toggle-save'),
    path('<int:pk>/comments/', views.CommentListCreateView.as_view(), name='comments'),
    
    # AI Generator
    path('ai-generate/', views.AIGenerateRecipeView.as_view(), name='ai-generate'),
    path('<int:pk>/ask-ai/', views.AskAIChefView.as_view(), name='ask-ai'),
]
