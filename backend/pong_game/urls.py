from django.urls import path
from .views import gamemode_selection

urlpatterns = [
    path('', gamemode_selection, name='gamemode_selection'),
]
