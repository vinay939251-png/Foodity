from rest_framework import serializers
from .models import Recipe, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']

class RecipeSerializer(serializers.ModelSerializer):
    # We bring in the Category details and the Author's username
    category = CategorySerializer(read_only=True)
    author_name = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'instructions', 
            'cooking_time', 'servings', 'category', 
            'author_name', 'image', 'is_ai_generated', 'created_at'
        ]