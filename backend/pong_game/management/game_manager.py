import asyncio

from asgiref.sync import async_to_sync, sync_to_async
from pong_game.gamelogic import GameState
from users.models import MatchHistory, UserProfile

class GameManager:
	_instance = None

	def __new__(cls, *args, **kwargs):
			if not cls._instance:
				cls._instance = super().__new__(cls, *args, **kwargs)
			return cls._instance

	def __init__(self):
		self.game_rooms = {}

	def find_or_create_game_room(self, playerid):
		for room, data in self.game_rooms.items():
			if len(data['players']) < 2 and not data['players'][0] == playerid :
				print('Room available')
				return room
		new_room = f"room_{len(self.game_rooms) + 1}"
		self.game_rooms[new_room] = {
			'players':[],
			'game_state': GameState(),
			'match_saved': False
		}
		print('----ROOM', new_room, 'CREATED-------')
		return new_room

	def add_player_to_room(self, room_name, player_id):
		if room_name in self.game_rooms:
			if len(self.game_rooms[room_name]['players']) < 2:
				self.game_rooms[room_name]['players'].append(player_id)

	async def remove_player_from_room(self, username, room_name):
		if room_name in self.game_rooms:
			players_copy = list(self.game_rooms[room_name]['players'])
			if username in players_copy:
				if self.game_rooms[room_name]['match_saved'] == True:
					await self.record_match_history(username, room_name)
				self.game_rooms[room_name]['players'].remove(username)
			if len(self.game_rooms[room_name]['players']) == 0:
				await self.remove_room(room_name)
	
	async def remove_room(self, room_name):
		if room_name in self.game_rooms:
			del self.game_rooms[room_name]
			print('----ROOM', room_name, 'DELETED-------')

					
	def players_in_room(self, room_name):
		if room_name in self.game_rooms:
			return self.game_rooms[room_name]['players']
		return[]

	def room_len(self, room_name):
		if room_name in self.game_rooms:
			return len(self.game_rooms[room_name]['players'])
		return 0

	async def record_match_history(self, username, room_name):
		print('----SAVING MATCH HISTORY FOR', username, '-------')
		player_one_id = self.game_rooms[room_name]['players'][0]
		player_two_id = self.game_rooms[room_name]['players'][1]
		player_one_score = self.game_rooms[room_name]['game_state'].players[0].score
		player_two_score = self.game_rooms[room_name]['game_state'].players[1].score
		winner = self.game_rooms[room_name]['game_state'].winning_player

		player_profile = await sync_to_async(UserProfile.objects.get)(username=username)
		match = await sync_to_async(MatchHistory.objects.create)(
			user=player_profile,
			player_one=player_one_id,
			player_two=player_two_id,
			player_one_score=player_one_score,
			player_two_score=player_two_score,
			winner=winner
		)
		await sync_to_async(match.save)()
	
	def display_game_rooms(self):
		if not self.game_rooms:
			print("No game rooms available.")
			return

		for room_name, room_data in self.game_rooms.items():
			print(f"Room: {room_name}")
			players = room_data['players']
			if players:
				print("Players:")
				for player in players:
					print(f"- {player}")
			else:
				print("No players in this room.")
			print() 

game_manager_instance = GameManager()
