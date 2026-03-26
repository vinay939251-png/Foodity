from rest_framework import serializers
from django.db.models import Sum
from .models import DailyLog, MealEntry

class MealEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MealEntry
        fields = '__all__'

class DailyLogSerializer(serializers.ModelSerializer):
    meal_entries = MealEntrySerializer(many=True, read_only=True)
    total_calories = serializers.SerializerMethodField()
    total_protein = serializers.SerializerMethodField()

    class Meta:
        model = DailyLog
        fields = ['id', 'date', 'water_intake', 'weight', 'meal_entries', 'total_calories', 'total_protein']

    def get_total_calories(self, obj):
        return obj.meal_entries.aggregate(Sum('calories'))['calories__sum'] or 0

    def get_total_protein(self, obj):
        return obj.meal_entries.aggregate(Sum('protein'))['protein__sum'] or 0