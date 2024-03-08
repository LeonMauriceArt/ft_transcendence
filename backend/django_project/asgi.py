import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

from pong_game.routing import websocket_urlpatterns
from tournament.urls import tournament_websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings')

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AuthMiddlewareStack(
		URLRouter(websocket_urlpatterns + tournament_websocket_urlpatterns)
	)
})
