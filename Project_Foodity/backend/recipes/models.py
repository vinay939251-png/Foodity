from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class UserProfile(models.Model):
    """Extended user profile linked to Django's built-in User model."""
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    
    is_public = models.BooleanField(default=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    language = models.CharField(max_length=50, null=True, blank=True, default='en')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.display_name or self.user.username

    class Meta:
        ordering = ['-created_at']


class Recipe(models.Model):
    """Core recipe model with all fields from the spec."""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    title = models.CharField(max_length=300, db_index=True)
    image = models.URLField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    servings = models.PositiveIntegerField(default=1)
    prep_time = models.PositiveIntegerField(default=0, help_text='Preparation time in minutes')
    cook_time = models.PositiveIntegerField(default=0, help_text='Cooking time in minutes')
    total_time = models.PositiveIntegerField(default=0, help_text='Total time in minutes')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    author = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipes'
    )
    source_url = models.URLField(max_length=500, blank=True, help_text='Original recipe URL')
    rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
    )
    ratings_count = models.PositiveIntegerField(default=0, db_index=True)
    likes_count = models.PositiveIntegerField(default=0, db_index=True)
    saves_count = models.PositiveIntegerField(default=0, db_index=True)
    is_complete = models.BooleanField(default=False, db_index=True)
    is_ai_generated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['title']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['rating']),
        ]


class Ingredient(models.Model):
    """Ingredient belonging to a recipe."""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=200)
    quantity = models.CharField(max_length=50, blank=True)
    unit = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        parts = [self.quantity, self.unit, self.name]
        return ' '.join(p for p in parts if p)

    class Meta:
        ordering = ['order']


class RecipeStep(models.Model):
    """Step-by-step cooking instructions."""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='steps')
    step_number = models.PositiveIntegerField()
    instruction = models.TextField()

    def __str__(self):
        return f'Step {self.step_number}: {self.instruction[:50]}'

    class Meta:
        ordering = ['step_number']
        unique_together = ['recipe', 'step_number']


class Nutrition(models.Model):
    """Nutritional information for a recipe (one-to-one)."""
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, related_name='nutrition')
    calories = models.FloatField(default=0)
    protein = models.FloatField(default=0, help_text='Protein in grams')
    carbs = models.FloatField(default=0, help_text='Carbohydrates in grams')
    fats = models.FloatField(default=0, help_text='Fats in grams')

    def __str__(self):
        return f'{self.recipe.title} - {self.calories} cal'

    class Meta:
        verbose_name_plural = 'Nutrition'


class Board(models.Model):
    """User-created boards to organize saved recipes."""
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='boards')
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=300, blank=True)
    is_public = models.BooleanField(default=True)
    collaborators = models.ManyToManyField(UserProfile, related_name='collaborative_boards', blank=True)
    cover_image = models.URLField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.owner} / {self.name}'

    class Meta:
        ordering = ['-created_at']
        unique_together = ['owner', 'name']


class Like(models.Model):
    """Tracks which users liked which recipes."""
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='likes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'recipe']

    def __str__(self):
        return f'{self.user} likes {self.recipe}'


class Save(models.Model):
    """Tracks recipes saved to boards."""
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='saves')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='saves')
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='saves')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'recipe', 'board']

    def __str__(self):
        return f'{self.user} saved {self.recipe} to {self.board}'


class Comment(models.Model):
    """Comments on recipes with one-level reply support."""
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='comments')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies'
    )
    text = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user}: {self.text[:50]}'

    class Meta:
        ordering = ['-created_at']


class Rating(models.Model):
    """User ratings and text reviews for a recipe."""
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='ratings')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review_text = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'recipe']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} rated {self.recipe} {self.score} stars'


class Conversation(models.Model):
    """A chat conversation between two users."""
    participants = models.ManyToManyField(UserProfile, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        names = ', '.join(str(p) for p in self.participants.all()[:2])
        return f'Chat: {names}'


class Message(models.Model):
    """A message in a conversation. Can optionally include a shared recipe."""
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField(max_length=2000, blank=True)
    shared_recipe = models.ForeignKey(
        Recipe, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='shares', help_text='Recipe card shared in this message'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender}: {self.text[:50] or "shared a recipe"}'


class MealLog(models.Model):
    """Tracks meals added to the calorie tracker."""
    MEAL_TYPES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('snacks', 'Snacks'),
        ('dinner', 'Dinner'),
        ('custom', 'Custom'),
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='meal_logs')
    date = models.DateField()
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    meal_name = models.CharField(max_length=200, blank=True, help_text='Custom meal name or auto-filled from recipe')
    recipe = models.ForeignKey(
        Recipe, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='meal_logs', help_text='Recipe this meal was logged from'
    )
    calories = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fats = models.FloatField(default=0)
    servings = models.FloatField(default=1)
    is_ai_estimated = models.BooleanField(default=False, help_text='Nutrition was auto-estimated by AI')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f'{self.user} - {self.meal_type} - {self.meal_name or "meal"} ({self.date})'


class Follow(models.Model):
    """Tracks follower-following relationships between users."""
    follower = models.ForeignKey(UserProfile, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(UserProfile, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.follower} follows {self.following}'


class Activity(models.Model):
    """Activity feed records generated by user actions."""
    ACTION_CHOICES = [
        ('liked', 'liked'),
        ('saved', 'saved'),
        ('commented', 'commented'),
        ('rated', 'rated'),
        ('created', 'created'),
        ('followed', 'followed'),
    ]
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='activities_generated')
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    target_recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, null=True, blank=True)
    target_user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True, related_name='activities_received')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f'{self.user} {self.action_type}'


# Signals for is_complete denormalization
@receiver([post_save, post_delete], sender='recipes.Ingredient')
@receiver([post_save, post_delete], sender='recipes.RecipeStep')
def update_recipe_completeness(sender, instance, **kwargs):
    if sender.__name__ == 'Ingredient':
        recipe = instance.recipe
    else:
        recipe = instance.recipe
        
    has_image = bool(recipe.image)
    ing_count = recipe.ingredients.count()
    step_count = recipe.steps.count()
    
    is_complete = has_image and ing_count > 0 and step_count > 0
    if recipe.is_complete != is_complete:
        recipe.is_complete = is_complete
        recipe.save(update_fields=['is_complete'])

@receiver(post_save, sender=Recipe)
def update_recipe_on_save(sender, instance, created, **kwargs):
    # If image changed, we might need to re-check
    # But wait, avoid infinite recursion. 
    # Only update if it's not a save(update_fields=['is_complete'])
    if kwargs.get('update_fields') and 'is_complete' in kwargs.get('update_fields'):
        return
        
    has_image = bool(instance.image)
    ing_count = instance.ingredients.count()
    step_count = instance.steps.count()
    
    is_complete = has_image and ing_count > 0 and step_count > 0
    if instance.is_complete != is_complete:
        instance.is_complete = is_complete
        instance.save(update_fields=['is_complete'])

@receiver([post_save, post_delete], sender='recipes.Rating')
def update_recipe_rating_aggregates(sender, instance, **kwargs):
    recipe = instance.recipe
    from django.db.models import Avg, Count
    aggs = recipe.ratings.aggregate(avg_score=Avg('score'), count=Count('id'))
    recipe.rating = round(aggs['avg_score'] or 0.0, 1)
    recipe.ratings_count = aggs['count'] or 0
    recipe.save(update_fields=['rating', 'ratings_count'])

# Activity Generation Signals
@receiver(post_save, sender=Recipe)
def create_recipe_activity(sender, instance, created, **kwargs):
    if created and instance.author:
        Activity.objects.create(user=instance.author, action_type='created', target_recipe=instance)

@receiver(post_save, sender=Like)
def create_like_activity(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(user=instance.user, action_type='liked', target_recipe=instance.recipe)

@receiver(post_save, sender=Save)
def create_save_activity(sender, instance, created, **kwargs):
    if created:
        # Check if a recent activity already exists to avoid spamming
        from django.utils import timezone
        from datetime import timedelta
        recent = Activity.objects.filter(
            user=instance.user, 
            action_type='saved', 
            target_recipe=instance.recipe,
            created_at__gt=timezone.now() - timedelta(minutes=5)
        ).exists()
        if not recent:
            Activity.objects.create(user=instance.user, action_type='saved', target_recipe=instance.recipe)

@receiver(post_save, sender=Comment)
def create_comment_activity(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(user=instance.user, action_type='commented', target_recipe=instance.recipe)

@receiver(post_save, sender=Rating)
def create_rating_activity(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(user=instance.user, action_type='rated', target_recipe=instance.recipe)

@receiver(post_save, sender=Follow)
def create_follow_activity(sender, instance, created, **kwargs):
    if created:
        # For following, we always want a fresh record to show the latest follow activity
        Activity.objects.create(user=instance.follower, action_type='followed', target_user=instance.following)
