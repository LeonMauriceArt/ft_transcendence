import json
import uuid
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .gamelogic import GameState

tick_rate = 60
tick_duration = 1 / tick_rate

class GameManager:
	def __init__(self):
		self.game_rooms = {}

	def find_or_create_game_room(self):
		print('checking for available room ...')
		for room, data in self.game_rooms.items():
			if len(data['players']) < 2:
				print('#GAMEMANAGER# Room available')
				return room
		print('no available room, creating one...')
		new_room = f"room_{len(self.game_rooms) + 1}"
		self.game_rooms[new_room] = {
			'players':[],
			'game_state': GameState()
		}
		print('#GAMEMANAGER# Creating a new room :', new_room)
		return new_room

	def add_player_to_room(self, room_name, player_id):
		print('#GAMEMANAGER# Adding player', player_id, 'to room', room_name)
		if room_name in self.game_rooms:
			if len(self.game_rooms[room_name]['players']) < 2:
				self.game_rooms[room_name]['players'].append(player_id)
				return True
		return False

	def remove_player_from_room(self, room_name, player_id):
		if room_name in self.game_rooms:
			if player_id in self.game_rooms[room_name]['players']:
				print('#GAMEMANAGER# Removing player', player_id, 'from room', room_name)
				self.game_rooms[room_name]['players'].remove(player_id)
				if (self.room_len(room_name) == 0):
					print('#GAMEMANAGER# Removing room', room_name)
					del self.game_rooms[room_name]

	def players_in_room(self, room_name):
		if room_name in self.game_rooms:
			return self.game_rooms[room_name]['players']
		return[]

	def room_len(self, room_name):
		if room_name in self.game_rooms:
			return len(self.game_rooms[room_name]['players'])
		return 0

	def display_all_rooms(self):
		for room, data in self.game_rooms.items():
					players = ', '.join(data['players'])
					print('-----GAME MANAGER------', f"Room: {room}, Players: {players}")



class GameConsumer(AsyncWebsocketConsumer):
	game_manager = GameManager()
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
		if self.game_manager.room_len(self.game_room) == 0:
			del self.game_manager.game_rooms[self.game_room]

	async def join_game(self):
		self.game_room = self.game_manager.find_or_create_game_room()
		self.game_manager.add_player_to_room(self.game_room, self.player_id)
		if self.game_manager.room_len(self.game_room) == 1:
			self.position = 1
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_one'
			}))
		else:
			self.position = 2
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_two'
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
			game = self.game_manager.game_rooms[self.game_room]['game_state']
			game.is_running = True
			await self.channel_layer.group_send(
				self.game_room,
				{
					'type': 'game_start',
					'playerId': self.player_id,
				}
			)
			print('#GAMECONSUMER# Room', self.game_room, 'full, can start game')
			game.ball.x_vel = game.ball.speed
			asyncio.create_task(self.game_loop())

	async def receive(self, text_data):
		data = json.loads(text_data)
		data_type = data.get("type", "")
		data_value = data.get("value", "")
		if data_type == 'player_key_down':
			await self.game_manager.game_rooms[self.game_room]['game_state'].set_player_movement(data.get("player", ""), True, data.get("direction"))
		if data_type == 'player_key_up':
			await self.game_manager.game_rooms[self.game_room]['game_state'].set_player_movement(data.get("player", ""), False, False)
		if data_type == 'player_left':
			if self.game_manager.game_rooms[self.game_room]['game_state'].is_running == True:
				print('------PLAYER LEFT--------')
				if data.get("player", "") == 'player_one':
					await self.end_game('player_two')
				elif data.get("player", "") == 'player_two':
					await self.end_game('player_one')
				
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
			'player': event.get('position'),
			'key': event.get('value')
		}))

	async def player_key_up(self, event):
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'player': event.get('position'),
			'key': event.get('value')
		}))
	async def ball_update(self, event):
		await self.send(text_data=json.dumps({
			'type': event.get('ball_update'),
			'player': event.get('position'),
			'key': event.get('value')
		}))
	async def game_state(self, event):
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'player_one_pos_y': event.get('player_one_pos_y'),
			'player_two_pos_y': event.get('player_two_pos_y'),
			'player_one_score': event.get('player_one_score'),
			'player_two_score': event.get('player_two_score'),
			'ball_x': event.get('ball_x'),
			'ball_y': event.get('ball_y'),
			'ball_x_vel': event.get('ball_x_vel'),
			'ball_y_vel': event.get('ball_y_vel'),
			'ball_color': event.get('ball_color'),
		}))
	async def game_end(self, event):
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'winner': event.get('winner'),
		}))
#END HANDLERS

	async def get_update_lock(self):
		if self.update_lock is None:
			self.update_lock = asyncio.Lock()
		return self.update_lock

	async def send_game_state(self):
		game = self.game_manager.game_rooms[self.game_room]['game_state']
		await self.channel_layer.group_send(
			self.game_room,
			{
				'type': 'game_state',
				'player_one_pos_y': game.players[0].y,
				'player_two_pos_y': game.players[1].y,
				'player_one_score': game.players[0].score,
				'player_two_score': game.players[1].score,
				'ball_x': game.ball.x,
				'ball_y': game.ball.y,
				'ball_x_vel': game.ball.x_vel,
				'ball_y_vel': game.ball.y_vel,
				'ball_color': game.ball.color,
			}
		)

	async def send_game_end(self, winner):
		await self.channel_layer.group_send(
		self.game_room,
		{
			'type': 'game_end',
			'winner': winner,
		}
	)

	async def end_game(self, winner):
		game = self.game_manager.game_rooms[self.game_room]['game_state']
		if not winner :
			game_winner = None
			if game.players[0].score >= game.winning_score:
				game_winner = 'player_one'
			elif game.players[1].score >= game.winning_score:
				game_winner = 'player_two'
			await self.send_game_end(game_winner)
		else:
			await self.send_game_end(winner)


	async def game_loop(self):
		game = self.game_manager.game_rooms[self.game_room]['game_state']
		async with await self.get_update_lock():
			while game.is_running == True:
				await game.update();
				await self.send_game_state()
				await asyncio.sleep(tick_duration)  # Example: Game loop sleeps for 1 second before updating game state
			await self.end_game(None)