from django.urls import path
from .views import gamemodes, gameoptions, lobby, pong_game, pong_game_practice

urlpatterns = [
    path('', gamemodes, name='gamemodes'),
	path('gameoptions/', gameoptions, name='gameoptions'),
	path('lobby/', lobby, name='lobby'),
	path('pong_game/', pong_game, name='pong_game'),
	path('pong_game_practice/', pong_game_practice, name='pong_game_practice'),

]
