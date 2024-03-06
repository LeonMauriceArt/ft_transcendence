import json
import uuid
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .gamelogic import GameState
from users.models import UserProfile

tick_rate = 60
tick_duration = 1 / tick_rate

class GameManager:
	def __init__(self):
		self.game_rooms = {}

	def find_or_create_game_room(self):
		for room, data in self.game_rooms.items():
			if len(data['players']) < 2:
				print('Room available')
				return room
		new_room = f"room_{len(self.game_rooms) + 1}"
		self.game_rooms[new_room] = {
			'players':[],
			'game_state': GameState()
		}
		return new_room

	def add_player_to_room(self, room_name, player_id):
		if room_name in self.game_rooms:
			if len(self.game_rooms[room_name]['players']) < 2:
				self.game_rooms[room_name]['players'].append(player_id)

	def remove_room(self, room_name):
		if room_name in self.game_rooms:
			for player_id in self.game_rooms[room_name]['players']:
				self.game_rooms[room_name]['players'].remove(player_id)
			del self.game_rooms[room_name]
					
	def players_in_room(self, room_name):
		if room_name in self.game_rooms:
			return self.game_rooms[room_name]['players']
		return[]

	def room_len(self, room_name):
		if room_name in self.game_rooms:
			return len(self.game_rooms[room_name]['players'])
		return 0

class GameConsumer(AsyncWebsocketConsumer):
	game_manager = GameManager()
	update_lock = None

	async def connect(self):
		if not hasattr(self, 'username'):
			self.username = self.scope['user'].username
		self.player_id = self.username
		await self.accept()
		await self.join_game()

	async def disconnect(self, close_code):
		if hasattr(self, 'game_room'):
				await self.channel_layer.group_send(
					self.game_room,
					{
						'type': 'player_left',
						'player': self.position,
					})
				self.game_manager.remove_room(self.game_room)
				await self.channel_layer.group_discard(self.game_room, self.channel_name)

	async def join_game(self):
		self.game_room = self.game_manager.find_or_create_game_room()
		self.game_manager.add_player_to_room(self.game_room, self.player_id)
		self.game = self.game_manager.game_rooms[self.game_room]['game_state']
		if self.game_manager.room_len(self.game_room) == 1:
			self.position = 1
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_one',
				'user': self.username
			}))
		else:
			self.position = 2
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_two',
				'user': self.username
			}))
		await self.channel_layer.group_add(
			self.game_room, self.channel_name
		)
		if len(self.game_manager.players_in_room(self.game_room)) == 2:
			await self.channel_layer.group_send(
				self.game_room,
				{
					'type': 'game_start',
					'player_one_name': self.game_manager.game_rooms[self.game_room]['players'][0],
					'player_two_name': self.game_manager.game_rooms[self.game_room]['players'][1]
				}
			)
			self.game.is_running = True
			self.game.ball.x_vel = self.game.ball.speed
			asyncio.create_task(self.game_loop())

	async def receive(self, text_data):
		data = json.loads(text_data)
		data_type = data.get("type", "")
		data_value = data.get("value", "")
		if data_type == 'player_key_down':
			await self.game.set_player_movement(data.get("player", ""), True, data.get("direction"))
		if data_type == 'player_key_up':
			await self.game.set_player_movement(data.get("player", ""), False, False)
		if data_type == 'player_left':
			if self.game.is_running == True:
				print('PLAYER', data.get("player", ""), 'LEFT')
				if data.get("player", "") == 'player_one':
					await self.end_game('player_two')
				elif data.get("player", "") == 'player_two':
					await self.end_game('player_one')
			else :
				await self.send(text_data=json.dumps({
					'type': 'game_end',
					'winner': 'player_one',
				}))

#-------HANDLING CHANNEL MESSAGES--------
	async def game_start(self, event):
		await self.send(text_data=json.dumps({
			'type':'game_start',
			'player_one_name': event.get('player_one_name'),
			'player_two_name': event.get('player_two_name')
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
		self.disconnect(42)

	async def player_left(self, event):
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'winner': event.get('winner'),
		}))
		self.disconnect(42)
		
#--------END HANDLERS---------

	async def get_update_lock(self):
		if self.update_lock is None:
			self.update_lock = asyncio.Lock()
		return self.update_lock

	async def send_game_state(self):
		await self.channel_layer.group_send(
			self.game_room,
			{
				'type': 'game_state',
				'player_one_pos_y': self.game.players[0].y,
				'player_two_pos_y': self.game.players[1].y,
				'player_one_score': self.game.players[0].score,
				'player_two_score': self.game.players[1].score,
				'ball_x': self.game.ball.x,
				'ball_y': self.game.ball.y,
				'ball_x_vel': self.game.ball.x_vel,
				'ball_y_vel': self.game.ball.y_vel,
				'ball_color': self.game.ball.color,
			}
		)

	async def send_game_end(self, winner):
		await self.save_history(winner)
		await self.channel_layer.group_send(self.game_room,
		{
			'type': 'game_end',
			'winner': winner,
		})

	async def end_game(self, default_winner):
		self.game.is_running = False
		if default_winner == 'get_winner':
			game_winner = None
			if self.game.players[0].score >= self.game.winning_score:
				game_winner_username = self.game_manager.game_rooms[self.game_room]['players'][0]
				game_winner = 'player_one'
			elif self.game.players[1].score >= self.game.winning_score:
				game_winner_username = self.game_manager.game_rooms[self.game_room]['players'][1]
				game_winner = 'player_two'
			await self.send_game_end(game_winner)
		else:
			await self.send_game_end(default_winner)

	async def game_loop(self):
		async with await self.get_update_lock():
			while self.game.is_running == True:
				await self.game.update()
				await self.send_game_state()
				await asyncio.sleep(tick_duration)
			if (self.game.someone_won == True):
				await self.end_game('get_winner')

	async def save_history(self, winner):
		user = UserProfile.objects.get(username=self.game_manager.game_rooms[self.game_room]['players'][0])

		match = MatchHistory.objects.create(
			player_one=self.game_manager.game_rooms[self.game_room]['players'][0],
			player_two=self.game_manager.game_rooms[self.game_room]['players'][1],
			player_one_score = self.game.players[0].score,
			player_two_score = self.game.players[1].score,
			winner = winner
		)
		user_one.matchHistory.add(match)
		user_two.matchHistory.add(match)
	# player_one = models.CharField(max_length=255, default="player_one")
	# player_two = models.CharField(max_length=255, default="player_two")
	# player_one_score = models.IntegerField(default=0)
	# player_two_score = models.IntegerField(default=0)
	# winner = models.CharField(max_length=255, default="winner")
