from rest_framework import generics
from .models import DailyLog
from .serializers import DailyLogSerializer
from rest_framework.permissions import IsAuthenticated

class DailyLogView(generics.ListCreateAPIView):
    serializer_class = DailyLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyLog.objects.filter(user=self.request.user)