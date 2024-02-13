from django.urls import path
from . import views

urlpatterns = [
    path('', views.play),
    path('quickmatch/', views.quickmatch),
    path('join_game/', views.join_game),
    path('create_game/', views.create_game),
    path('practice/', views.practice),
    path('local/', views.local),
]
