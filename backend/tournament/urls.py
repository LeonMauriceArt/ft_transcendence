from django.urls import path
from . import views

urlpatterns = [
    path('', views.play_tournament),
    path('create_local/', views.create_local),
    path('current_state/', views.current_state)
]

