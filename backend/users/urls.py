from django.urls import path
from .views import (
    registration_view,
    logout_view,
    user,
    auth_status,
    login_view, 
    profile,
    edit_profile,
    list_users_online, 
    send_friend_request,
    accept_friend_request,
    user_profile,
    username
)
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', user, name='user'),
    path('register/', registration_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('auth_status/', auth_status, name='auth_status'),
    path('profile/', profile, name='profile'),
    path('online/', list_users_online, name='list_users_online'),
    path('edit_profile/', edit_profile, name='edit_profile'), 
    path('change_password_done/', auth_views.PasswordChangeDoneView.as_view(template_name='change_password_done.html'), name='change_password_done'),
    path('change_password/', auth_views.PasswordChangeView.as_view(template_name='change_password.html', success_url='/user/change_password_done/'), name='change_password'), 
    path('send_friend_request/<int:user_id>/', send_friend_request, name='send_friend_request'),
    path('accept_friend_request/<int:friendship_id>/', accept_friend_request, name='accept_friend_request'),
    path('user_profile/<int:user_id>/', user_profile, name='user_profile'),
    path('username/', username)
]