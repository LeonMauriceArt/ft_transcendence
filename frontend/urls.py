from django.urls import path, include
from .views import navbar, user, welcome
from . import views

urlpatterns = [
    path('', navbar, name='navbar'),
    path('game/', include('pong_game.urls')),
    path('user/', user, name='user'),
	path('welcome/', welcome, name='welcome'),
]
