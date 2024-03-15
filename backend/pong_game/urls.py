from django.urls import path
from . import views

urlpatterns = [
    path('', views.play),
    path('quickmatch/', views.quickmatch),
    path('practice/', views.practice),
    path('local/', views.local),
]
