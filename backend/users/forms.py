from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import UserProfile

class RegistrationForm(UserCreationForm):
    class Meta:
        model = UserProfile
        fields = ("username", "password1", "password2", "first_name", "last_name")

class LoginForm(AuthenticationForm):
    class Meta:
        model = UserProfile
        fields = ("username", "password")
