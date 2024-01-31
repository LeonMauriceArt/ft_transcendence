from django.urls import path, include
from .views import navbar, welcome
from . import views

urlpatterns = [
    path('', navbar, name='navbar'),
    path('game/', include('pong_game.urls')),
    path('user/', include('users.urls')),
	path('welcome/', welcome, name='welcome'),
]
