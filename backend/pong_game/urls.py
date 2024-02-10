from django.urls import path
from .views import play, quickmatch, join_game, create_game, practice

urlpatterns = [
    path('', play, name='play'),
    path('quickmatch/', quickmatch, name='quickmatch'),
    path('join_game/', join_game, name='join_game'),
    path('create_game/', create_game, name='create_game'),
    path('practice/', practice, name='practice'),
]
