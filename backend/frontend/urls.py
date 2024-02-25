from django.urls import path, include
from .views import welcome
from . import views

urlpatterns = [
    path('', welcome, name='welcome'),
    path('play/', include('pong_game.urls')),
    path('tournament/', include('tournament.urls')),
    path('user/', include('users.urls'))
]
