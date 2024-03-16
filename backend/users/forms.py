from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import UserProfile

class ClearableFileInputCustom(forms.ClearableFileInput):
    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['widget']['is_initial'] = False
        return context

class RegistrationForm(UserCreationForm):
    class Meta:
        model = UserProfile
        fields = ("username", "alias","password1", "password2", "first_name", "last_name", "avatar")

class LoginForm(AuthenticationForm):
    class Meta:
        model = UserProfile
        fields = ("username", "password")

class ModifyForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ("username", "alias","first_name", "last_name", 'avatar')
        widgets = {
            'avatar': ClearableFileInputCustom(),
        }