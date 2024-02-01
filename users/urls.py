from django.urls import path
from .views import user,submit_login

urlpatterns = [
    path('', user, name='user'),
    path('submit_login/', submit_login, name='submit_login'),
]
