from django.urls import path
from .views import home, game, user, welcome

urlpatterns = [
    path('', home, name='home'),
    path('game/', game, name='game'),
    path('user/', user, name='user'),
	path('welcome/', welcome, name='welcome'),
]
