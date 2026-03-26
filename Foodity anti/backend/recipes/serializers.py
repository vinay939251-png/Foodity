from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Recipe, Ingredient, RecipeStep,
    Nutrition, Board, Like, Save, Comment,
    Conversation, Message, MealLog, Follow,
)


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'display_name',
            'avatar_url', 'bio', 'followers_count',
            'following_count', 'is_following', 'created_at'
        ]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if current user follows this profile
            profile = getattr(request.user, 'profile', None)
            if profile and profile.id != obj.id:
                from .models import Follow
                return Follow.objects.filter(follower=profile, following=obj).exists()
        return False


class FollowSerializer(serializers.ModelSerializer):
    follower = UserProfileSerializer(read_only=True)
    following = UserProfileSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'quantity', 'unit', 'order']


class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ['id', 'step_number', 'instruction']


class NutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrition
        fields = ['calories', 'protein', 'carbs', 'fats']


class CommentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'parent', 'replies', 'is_mine', 'created_at']

    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.select_related('user__user').all()
            return CommentSerializer(replies, many=True, context=self.context).data
        return []

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            profile = getattr(request.user, 'profile', None)
            return profile and obj.user_id == profile.id
        return False


class RecipeListSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'image', 'description',
            'rating', 'likes_count', 'saves_count',
            'prep_time', 'cook_time', 'total_time',
            'difficulty', 'author', 'is_liked', 'is_saved',
            'created_at',
        ]

    def get_is_liked(self, obj):
        liked_ids = self.context.get('liked_recipe_ids', set())
        return obj.id in liked_ids

    def get_is_saved(self, obj):
        saved_ids = self.context.get('saved_recipe_ids', set())
        return obj.id in saved_ids


class RecipeDetailSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    ingredients = IngredientSerializer(many=True, required=False)
    steps = RecipeStepSerializer(many=True, required=False)
    nutrition = NutritionSerializer(required=False, allow_null=True)
    comments = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'image', 'description',
            'servings', 'prep_time', 'cook_time', 'total_time',
            'difficulty', 'rating', 'likes_count', 'saves_count',
            'is_ai_generated', 'source_url',
            'author', 'ingredients', 'steps', 'nutrition',
            'comments', 'is_liked', 'is_saved',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['rating', 'likes_count', 'saves_count', 'is_ai_generated']

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', [])
        steps_data = validated_data.pop('steps', [])
        nutrition_data = validated_data.pop('nutrition', None)
        
        # Total time calculation
        if 'total_time' not in validated_data or validated_data.get('total_time') == 0:
            validated_data['total_time'] = validated_data.get('prep_time', 0) + validated_data.get('cook_time', 0)
            
        # Difficulty calculation
        if 'difficulty' not in validated_data:
            tt = validated_data.get('total_time', 0)
            if tt <= 30:
                validated_data['difficulty'] = 'easy'
            elif tt <= 60:
                validated_data['difficulty'] = 'medium'
            else:
                validated_data['difficulty'] = 'hard'

        recipe = Recipe.objects.create(**validated_data)

        for ingredient in ingredients_data:
            Ingredient.objects.create(recipe=recipe, **ingredient)
        
        for step in steps_data:
            RecipeStep.objects.create(recipe=recipe, **step)

        if nutrition_data:
            Nutrition.objects.create(recipe=recipe, **nutrition_data)

        return recipe

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        steps_data = validated_data.pop('steps', None)
        nutrition_data = validated_data.pop('nutrition', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if 'prep_time' in validated_data or 'cook_time' in validated_data:
             if 'total_time' not in validated_data or validated_data.get('total_time') == 0:
                 instance.total_time = instance.prep_time + instance.cook_time
                 if instance.total_time <= 30:
                     instance.difficulty = 'easy'
                 elif instance.total_time <= 60:
                     instance.difficulty = 'medium'
                 else:
                     instance.difficulty = 'hard'
                     
        instance.save()

        # Overwrite nested 
        if ingredients_data is not None:
            instance.ingredients.all().delete()
            for ingredient in ingredients_data:
                Ingredient.objects.create(recipe=instance, **ingredient)

        if steps_data is not None:
            instance.steps.all().delete()
            for step in steps_data:
                RecipeStep.objects.create(recipe=instance, **step)

        if nutrition_data is not None:
            if hasattr(instance, 'nutrition'):
                for attr, value in nutrition_data.items():
                    setattr(instance.nutrition, attr, value)
                instance.nutrition.save()
            else:
                Nutrition.objects.create(recipe=instance, **nutrition_data)

        return instance

    def get_comments(self, obj):
        comments = (
            obj.comments.filter(parent__isnull=True)
            .select_related('user__user')
            .prefetch_related('replies__user__user')
            .order_by('-created_at')[:20]
        )
        return CommentSerializer(comments, many=True, context=self.context).data

    def get_is_liked(self, obj):
        liked_ids = self.context.get('liked_recipe_ids', set())
        return obj.id in liked_ids

    def get_is_saved(self, obj):
        saved_ids = self.context.get('saved_recipe_ids', set())
        return obj.id in saved_ids


class BoardSerializer(serializers.ModelSerializer):
    owner = UserProfileSerializer(read_only=True)
    recipe_count = serializers.SerializerMethodField()
    cover_images = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'owner', 'name', 'description', 'is_public',
                  'cover_image', 'recipe_count', 'cover_images', 'created_at']

    def get_recipe_count(self, obj):
        return obj.saves.count()

    def get_cover_images(self, obj):
        return list(
            obj.saves.select_related('recipe')
            .values_list('recipe__image', flat=True)[:4]
        )


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'recipe', 'created_at']


class SaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Save
        fields = ['id', 'recipe', 'board', 'created_at']


class SaveWithRecipeSerializer(serializers.ModelSerializer):
    recipe = RecipeListSerializer(read_only=True)
    
    class Meta:
        model = Save
        fields = ['id', 'recipe', 'created_at']


class BoardWithRecipesSerializer(BoardSerializer):
    recipes = SaveWithRecipeSerializer(source='saves', many=True, read_only=True)

    class Meta(BoardSerializer.Meta):
        fields = BoardSerializer.Meta.fields + ['recipes']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    shared_recipe = RecipeListSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'text', 'shared_recipe', 'is_read', 'created_at']


class ConversationListSerializer(serializers.ModelSerializer):
    participants = UserProfileSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'unread_count', 'updated_at']

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            profile = getattr(request.user, 'profile', None)
            if profile:
                return obj.messages.filter(is_read=False).exclude(sender=profile).count()
        return 0


class MealLogSerializer(serializers.ModelSerializer):
    recipe_title = serializers.CharField(source='recipe.title', read_only=True, default='')
    recipe_image = serializers.URLField(source='recipe.image', read_only=True, default='')

    class Meta:
        model = MealLog
        fields = [
            'id', 'date', 'meal_type', 'meal_name',
            'recipe', 'recipe_title', 'recipe_image',
            'calories', 'protein', 'carbs', 'fats',
            'servings', 'is_ai_estimated', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

