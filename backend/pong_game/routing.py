from django.urls import re_path
from .consumers import GameConsumer
import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from tournament.urls import tournament_websocket_urlpatterns

websocket_urlpatterns = [
	re_path(r"ws/game/$", GameConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AuthMiddlewareStack(
		URLRouter(websocket_urlpatterns + tournament_websocket_urlpatterns)
	)
})
