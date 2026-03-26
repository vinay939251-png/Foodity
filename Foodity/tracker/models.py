from django.db import models
from django.conf import settings
from common.models import BaseModel
from recipes.models import Recipe

class DailyLog(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_logs')
    date = models.DateField(auto_now_add=True)
    water_intake = models.PositiveIntegerField(default=0, help_text="In milliliters")
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Weight in kg")

    class Meta:
        unique_together = ('user', 'date') # A user can only have one log per day

    def __str__(self):
        return f"{self.user.email} - {self.date}"

class MealEntry(BaseModel):
    MEAL_TYPES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]

    log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='meal_entries')
    recipe = models.ForeignKey(Recipe, on_delete=models.SET_NULL, null=True, blank=True)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    calories = models.PositiveIntegerField() # We store this here in case the recipe changes later
    protein = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    carbs = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    fats = models.DecimalField(max_digits=5, decimal_places=1, default=0)

    def __str__(self):
        return f"{self.meal_type} for {self.log.date}"