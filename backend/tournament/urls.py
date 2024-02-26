from django.urls import path
from . import views

urlpatterns = [
    path('', views.play_tournament),
    path('create_local/', views.create_local),
    path('current_state/', views.current_state),
    path('create_online/', views.create_online),
    path('join_online/', views.join_online),
    path('pre_lobby/', views.pre_lobby),
    path('lobby/', views.lobby),
    path('api/tournament/', views.api_tournament),
    path('api/tournament/<int:tournament_id>/', views.api_tournament_arg)
]

