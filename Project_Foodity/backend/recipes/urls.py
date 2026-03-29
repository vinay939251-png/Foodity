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
    path('<int:pk>/ratings/', views.RatingListCreateView.as_view(), name='ratings'),
    
    # Search
    path('autocomplete/', views.AutocompleteView.as_view(), name='autocomplete'),
    
    # Activity
    path('activity/', views.ActivityFeedView.as_view(), name='activity-feed'),

    # AI Generator
    path('ai-generate/', views.AIGenerateRecipeView.as_view(), name='ai-generate'),
    path('ai-nutrition/', views.GenerateNutritionView.as_view(), name='ai-nutrition'),
    path('<int:pk>/ask-ai/', views.AskAIChefView.as_view(), name='ask-ai'),
]
