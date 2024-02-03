from django.urls import path
from .views import user,login_form,submit_login,registration_form

urlpatterns = [
    path('', user, name='user'),
    path('login_form/', login_form, name='login_form'),
    path('register_form/', registration_form, name='register_form'),
    path('submit_login/', submit_login, name='submit_login'),
]
