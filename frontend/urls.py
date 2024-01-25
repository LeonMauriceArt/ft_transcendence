from django.urls import path, include
from .views import index, user, welcome

urlpatterns = [
    path('', index, name='index'),
    path('game/', include('pong_game.urls')),
    path('user/', user, name='user'),
	path('welcome/', welcome, name='welcome'),
]
