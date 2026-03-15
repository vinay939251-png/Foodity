from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class UserProfile(models.Model):
    """Extended user profile linked to Django's built-in User model."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    bio = models.TextField(max_length=500, blank=True)
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
    likes_count = models.PositiveIntegerField(default=0)
    saves_count = models.PositiveIntegerField(default=0)
    is_ai_generated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f'{self.user} - {self.meal_type} - {self.meal_name or "meal"} ({self.date})'


