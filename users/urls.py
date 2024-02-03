from django.urls import path
from .views import user,login_form,submit_login,registration_form,submit_register

urlpatterns = [
    path('', user, name='user'),
    path('login_form/', login_form, name='login_form'),
    path('register_form/', registration_form, name='register_form'),
    path('submit_login/', submit_login, name='submit_login'),
    path('submit_register/', submit_register, name='submit_register'),
]
