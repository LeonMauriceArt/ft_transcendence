from django.urls import path, re_path
from . import views
from . import consumers

urlpatterns = [
    path('', views.tournament_page),
    path('create_local_page/', views.create_local_page),
    path('create_online_page/', views.create_online_page),
    path('tournament_requests_page/', views.tournament_requests_page),
    path('invite_page/', views.invite_page),

    path('api/create_tournament/', views.create_tournament),
    path('api/tournament_requests/', views.tournament_requests)
]

tournament_websocket_urlpatterns = [
    re_path(r'ws/tournament/(?P<tournament_id>[0-9a-f-]+)$', consumers.TournamentConsumer.as_asgi()),
]