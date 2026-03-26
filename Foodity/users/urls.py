from django.urls import path
from .views import (
    UserProfileView, RegisterView, 
    DeactivateAccountView, ChangePasswordView
)
urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('register/', RegisterView.as_view(), name='register'),
    path('deactivate/', DeactivateAccountView.as_view(), name='deactivate'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]