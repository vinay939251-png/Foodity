from django.contrib import admin
from .models import (
    UserProfile, Recipe, Ingredient, RecipeStep,
    Nutrition, Board, Like, Save, Comment,
)


class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 1


class RecipeStepInline(admin.TabularInline):
    model = RecipeStep
    extra = 1


class NutritionInline(admin.StackedInline):
    model = Nutrition
    extra = 0


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'user', 'created_at']
    search_fields = ['display_name', 'user__username']


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'rating', 'likes_count', 'saves_count', 'created_at']
    list_filter = ['difficulty', 'is_ai_generated']
    search_fields = ['title', 'description']
    inlines = [IngredientInline, RecipeStepInline, NutritionInline]


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'is_public', 'created_at']
    list_filter = ['is_public']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'recipe', 'text', 'created_at']
    list_filter = ['created_at']


admin.site.register(Ingredient)
admin.site.register(RecipeStep)
admin.site.register(Nutrition)
admin.site.register(Like)
admin.site.register(Save)
