from django.urls import path
from .views import (
    registration_view,
    logout_view,
    user,
    auth_status,
    delete_users,
    login_view, 
    profile,
    edit_profile,
)
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', user, name='user'),
    path('register/', registration_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('auth_status/', auth_status, name='auth_status'),
    path('deleteusers/', delete_users, name='delete_users'),
    path('profile/', profile, name='profile'),
    path('edit_profile/', edit_profile, name='edit_profile'), 
    path('change_password_done/', auth_views.PasswordChangeDoneView.as_view(template_name='change_password_done.html'), name='change_password_done'),
    path('change_password/', auth_views.PasswordChangeView.as_view(template_name='change_password.html', success_url='/user/change_password_done/'), name='change_password'),
]
