import json
import uuid
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

game_area_width = 70
game_area_height = 50

tick_rate = 60  # ticks per second
tick_duration = 1 / tick_rate  # duration of each tick in seconds
# tick_duration_ms = tick_duration * 1000  # convert to milliseconds

class GameState:

	class Ball:
		def __init__(self):
			self.x = 0
			self.y = 0
			self.x_vel = 0
			self.y_vel = 0
			self.color = 0xffffff
		def __str__(self):
			return f"Ball position: ({self.x}, {self.y}), Ball vel: {self.x_vel}x{self.y_vel}, Color: {self.color}"

	class Player:
		def __init__(self, position):
			if position == 1:
				self.x = (game_area_width * -1) + 10
			else:
				self.x = game_area_width - 10
			self.y = 0
			self.paddle_width = 5
			self.paddle_height = 20
			self.score = 0
		def __str__(self):
			return f"Player position: ({self.x}, {self.y}), Paddle size: {self.paddle_width}x{self.paddle_height}, Score: {self.score}"

		def update_position(self):
			pass

	def __init__(self):
		self.ball = self.Ball()
		self.players = [self.Player(1), self.Player(2)]

	async def handle_player_input(self, player_id, input_data):
		pass

	async def update_game_state(self):
		pass

	def printState(self):
		print('|player1 state|:', self.players[0])
		print('|player2 state|:', self.players[1])
		print('|ball state|:', self.ball)


class GameManager:
	def __init__(self):
		self.game_rooms = {}

	def find_or_create_game_room(self):
		for room, players in self.game_rooms.items():
			if len(players) < 2:
				print('#GAMEMANAGER# Room available')
				return room
		new_room = f"room_{len(self.game_rooms) + 1}"
		self.game_rooms[new_room] = []
		print('#GAMEMANAGER# Creating a new room :', new_room)
		return new_room

	def add_player_to_room(self, room_name, player_id):
		print('#GAMEMANAGER# Adding player', player_id, 'to room', room_name)
		if room_name in self.game_rooms:
			if len(self.game_rooms[room_name]) < 2:
				self.game_rooms[room_name].append(player_id)
				return True
		return False

	def remove_player_from_room(self, room_name, player_id):
		if room_name in self.game_rooms:
			if player_id in self.game_rooms[room_name]:
				print('#GAMEMANAGER# Removing player', player_id, 'from room', room_name)
				self.game_rooms[room_name].remove(player_id)
				if (self.room_len(room_len) == 0):
					print('#GAMEMANAGER# Removing room', room_name)
					self.game_rooms.remove(room_name)

	def players_in_room(self, room_name):
		print('#GAMEMANAGER# Number of players in', room_name, '=', len(self.game_rooms[room_name]))
		return self.game_rooms.get(room_name, [])

	def room_len(self, room_name):
		return(len(self.game_rooms[room_name]))

	def display_all_rooms(self):
		for room, players in self.game_rooms.items():
			print('-----GAME MANAGER------', f"Room: {room}, Players: {', '.join(players)}")


class GameConsumer(AsyncWebsocketConsumer):
	game_manager = GameManager()
	gamestate = GameState()
	update_lock = None

	async def connect(self):
		print('----USER CONNECTING TO GAME----')
		self.player_id = str(uuid.uuid4())
		await self.accept()
		await self.join_game()


	async def disconnect(self, close_code):
		self.game_manager.remove_player_from_room(self.game_room, self.player_id)
		await self.channel_layer.group_discard(
			self.game_room, self.channel_name
		)
	
	async def join_game(self):
		self.game_room = self.game_manager.find_or_create_game_room()
		self.game_manager.add_player_to_room(self.game_room, self.player_id)
		print('ROOM LEN FOR POSITION', self.game_manager.room_len(self.game_room))
		if self.game_manager.room_len(self.game_room) == 1:
			self.position = 1
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'1'
			}))
		else:
			self.position = 2
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'2'
			}))

		await self.channel_layer.group_add(
			self.game_room, self.channel_name
		)
		print('#GAMECONSUMER# Adding group', self.game_room, self.channel_name, 'to channel layer')
		await self.channel_layer.group_send(
			self.game_room,
			{
				'type': 'player_join',
				'player_id': self.player_id,
			}
		)

		if len(self.game_manager.players_in_room(self.game_room)) == 2:
			await self.channel_layer.group_send(
				self.game_room,
				{
					'type': 'game_start',
					'playerId': self.player_id,
				}
			)
			print('#GAMECONSUMER# Room', self.game_room, 'full, can start game')
			asyncio.create_task(self.game_loop())

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		data_type = text_data_json.get("type", "")
		data_value = text_data_json.get("value", "")
		print('RECEIVING DATA TYPE:', data_type, '| VALUE:', data_value)
		if data_type == 'player_key_down':
			await self.channel_layer.group_send(
				self.game_room,
				{
					'type': data_type,
					'position': self.position,
					'value': data_value
				}
			)
		if data_type == 'player_key_up':
			await self.channel_layer.group_send(
				self.game_room,
				{
					'type': data_type,
					'position': self.position,
					'value': data_value
				}
			)
		if data_type == 'ball_update':
			await self.channel_layer.group_send(
				self.game_room,
				{
					'type': data_type,
					'position': self.position,
					'value': data_value
				}
			)

#HANDLING MESSAGES
	async def player_join(self, event):
		print(event.get('type'))

	async def player_left(self, event):
		print('PLAYER LEFT')

	async def game_start(self, event):
		await self.send(text_data=json.dumps({
			'type':'game_start'
		}))

	async def player_key_down(self, event):
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'position': event.get('position'),
			'key': event.get('value')
		}))

	async def player_key_up(self, event):
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'position': event.get('position'),
			'key': event.get('value')
		}))
	async def ball_update(self, event):
		await self.send(text_data=json.dumps({
			'type': event.get('ball_update'),
			'position': event.get('position'),
			'key': event.get('value')
		}))
#END HANDLERS
	async def get_update_lock(self):
		if self.update_lock is None:
			self.update_lock = asyncio.Lock()
		return self.update_lock

	async def game_loop(self):
		async with await self.get_update_lock():
			while True:
				print('Game_Update')
				await asyncio.sleep(tick_duration)  # Example: Game loop sleeps for 1 second before updating game state
