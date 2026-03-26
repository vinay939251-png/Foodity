from django.contrib import admin
from .models import DailyLog, MealEntry

admin.site.register(DailyLog)
admin.site.register(MealEntry)