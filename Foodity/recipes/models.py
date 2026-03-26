from django.db import models
from common.models import BaseModel
from django.conf import settings

class Category(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Recipe(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructions = models.TextField()
    cooking_time = models.PositiveIntegerField(help_text="Time in minutes")
    servings = models.PositiveIntegerField(default=1)
    
    # Relationships
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='recipes'
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='recipes'
    )
    
    # Image (Stored in the media/recipes folder you created earlier)
    image = models.ImageField(upload_to='recipes/', null=True, blank=True)
    
    # Stats
    is_ai_generated = models.BooleanField(default=False)

    def __str__(self):
        return self.title
