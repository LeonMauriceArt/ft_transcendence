from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'is_staff')

admin.site.register(UserProfile, UserAdmin)