from django.urls import path
from .views import index, game, user, welcome

urlpatterns = [
    path('', index, name='index'),
    path('game/', game, name='game'),
    path('user/', user, name='user'),
	path('welcome/', welcome, name='welcome'),
]
