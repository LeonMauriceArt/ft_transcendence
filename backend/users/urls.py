from django.urls import path
from .views import (
    registration_view,
    user
)
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', user, name='user'),
    path('register/', registration_view, name='register'),
]
