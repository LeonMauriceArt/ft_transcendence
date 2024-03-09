from django.core.management.base import BaseCommand
from pong_game.management.game_manager import game_manager_instance

class Command(BaseCommand):
	help = "Display all rooms in GameManager"

	def handle(self, *args, **kwargs):
		game_manager_instance.display_game_rooms()