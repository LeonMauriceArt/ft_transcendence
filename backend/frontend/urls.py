from django.urls import path, include
from .views import welcome, navbar_view
from . import views

urlpatterns = [
    path('', welcome, name='welcome'),
    path('play/', include('pong_game.urls')),
    path('user/', include('users.urls')),
    path('navbar/', navbar_view, name='navbar_view')
]
