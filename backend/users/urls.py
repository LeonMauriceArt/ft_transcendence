from django.urls import path
from .views import (
    registration_view,
    logout_view,
    user,
    auth_status,
    delete_users,
    login_view
)
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', user, name='user'),
    path('register/', registration_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('auth_status/', auth_status, name='auth_status'),
    path('deleteusers/', delete_users, name='delete_users')
]
