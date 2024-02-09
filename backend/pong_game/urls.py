from django.urls import path
from .views import play, create_game, practice

urlpatterns = [
    path('', play, name='play'),
    path('create_game/', create_game, name='create_game'),
    path('practice/', practice, name='practice'),

]
