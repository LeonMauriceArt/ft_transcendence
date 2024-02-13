import json
import uuid
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# There is one dedicated GameConsumer per player
class GameConsumer(AsyncWebsocketConsumer):
	game_room = "testroom"
	players= {}
	update_lock = asyncio.Lock()

	async def connect(self):
		print('----USER CONNECTING TO GAME----')

		self.player_id = str(uuid.uuid4())
		await self.accept()
		await self.channel_layer.group_add(
			self.game_room, self.channel_name
		)
		await self.send(
			text_data=json.dumps({
			'type': 'playerId',
			'playerId': self.player_id,
		}))

		async with self.update_lock:
			self.players[self.player_id] = {
				"id": self.player_id,
		}
		if len(self.players) == 1:
			asyncio.create_game(self.game_loop())

	async def disconnect(self, close_code):
		async with self.update_lock:
			if self.player_id in self.players:
				del self.players[self.player_id]
		await self.channel_layer.group_discard(
			self.game_room, self.channel_name
		)
	
	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message_type = text_data_json.get("type", "")

		player_id = text_data_json["playerId"]

		async with self.update_lock:
			player = self.players.get(player_id, None)
			if not player:
				return

			if message_type == "input_up":
				player["up"] = True
			if message_type == "input_down":
				player["down"] = True
			if message_type == "input_power":
				player["power"] = True

		game_state_update = {}
		await self.send(text_data=json.dumps({
			'type':'game_state',
			'data':game_state_update,	
		}))
		await self.channel_layer.group_send(
			self.game_room,
			{
				'type':'game_state',
				'data':game_state_update,
			}
		)

	async def game_loop(self):
		while True:
			await asyncio.sleep(1)  # Example: Game loop sleeps for 1 second before updating game state
			game_state_update = {}  # Calculate your game state update
			await self.channel_layer.group_send(self.game_room, {
				'type': 'game_state',
				'data': game_state_update,
			})
