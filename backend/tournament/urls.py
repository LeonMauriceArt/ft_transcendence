from django.urls import path
from . import views

urlpatterns = [
    path('', views.play_tournament),
    path('create_local/', views.create_local),
    path('current_state/', views.current_state),
    path('create_online/', views.create_online),
    path('join_online/', views.join_online),
    path('api/tournament/', views.api_tournament)
]

