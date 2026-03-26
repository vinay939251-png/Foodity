from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from .serializers import UserSerializer, RegisterSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        user.is_active = False
        user.save()
        return Response({"message": "Account deactivated"}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        old_pw = request.data.get("old_password")
        new_pw = request.data.get("new_password")
        if not request.user.check_password(old_pw):
            return Response({"error": "Wrong old password"}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_pw)
        request.user.save()
        update_session_auth_hash(request, request.user)
        return Response({"message": "Password changed"}, status=status.HTTP_200_OK)