import json
import copy
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer

from pong_game.gamelogic import GameState

from enum import Enum

tick_rate = 60
tick_duration = 1 / tick_rate

class TournamentState(Enum):
    LOBBY = "LOBBY"
    DEMI_FINALS1 = "DEMIFINALS1"
    DEMI_FINALS2 = "DEMIFINALS2"
    FINALS = "FINALS"

class PlayerState(Enum):
    PENDING = "PENDING"
    WINNER = "WINNER" 
    LOSER = "LOSER"
    LEFT = "LEFT"

class TournamentManager():
    def __init__(self):
        self.rooms = {}
    
    def create_or_add_player_to_room(self, roomId, player):
        current_room = self.rooms.get(roomId, {})

        if current_room and len(current_room.get('players', [])) >= 4:
            print('ROOM FULL')
            return False

        if not current_room:
            print('CREATION OF THE ROOM')
            current_room = {
                'state': TournamentState.LOBBY.name,
                'owner': player,
                'players': [player],
                'players_state': [PlayerState.PENDING.name, PlayerState.PENDING.name, PlayerState.PENDING.name, PlayerState.PENDING.name],
                'game_state': GameState()
            }
            self.rooms[roomId] = current_room
        else:
            print('ADDING TO THE CURRENT ROOM')
            current_room['players'].append(player)
            self.rooms[roomId] = current_room

        print(f'PLAYER ADDED TO ROOM, ROOM NOW {self.get_printable_room(roomId)}')
        return True

    def remove_player_from_room(self, roomId, player):
        current_room = self.rooms.get(roomId, {})

        if current_room and player in current_room.get('players', []):
            print(f'REMOVING PLAYER {player} FROM ROOM {roomId}')

            current_room['players'].remove(player)

            if len(current_room['players']) == 0:
                print(f'REMOVING ROOM CAUSE NOW EMPTY...')
                del self.rooms[roomId]
                return
            elif player == current_room.get('owner'):
                current_room['owner'] = current_room['players'][0]

            self.rooms[roomId] = current_room

            print(f'PLAYER REMOVED FROM ROOM, ROOM NOW => {self.get_printable_room(roomId)}')

    def get_room(self, roomId):
        return self.rooms.get(roomId, [])

    def get_printable_room(self, roomId):
        room = copy.copy(self.get_room(roomId))
        room.pop('game_state')
        return room

    def start_tournament(self, roomId):
        room = self.get_room(roomId)

        if room and len(room.get('players', [])) != 4:
            print('Cannot start tournament , there is not 4 player in the lobby')
            return False
        
        print('TOURNAMENT WILL START XD')

        room['state'] = TournamentState.DEMI_FINALS1.name

        return True
    
    def get_players_turn(self, roomId):
        players = []
        room = self.get_room(roomId)
        if (room['state'] == TournamentState.DEMI_FINALS1.name):
            players.append(room['players'][0])
            players.append(room['players'][1])
        
        return players

class TournamentConsumer(AsyncWebsocketConsumer):
    tournament_manager = TournamentManager()
    update_lock = None
    async def connect(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        player = self.scope['user'].username

        # Join room group
        await self.channel_layer.group_add(
            tournament_id,
            self.channel_name
        )

        if self.tournament_manager.create_or_add_player_to_room(tournament_id, player):
            await self.accept()
        else:
            await self.close()
        
        await self.send_players_update()

    async def disconnect(self, close_code):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        player = self.scope['user'].username
        
        self.tournament_manager.remove_player_from_room(tournament_id, player)

        await self.send_players_update()
        
        # Leave room group
        await self.channel_layer.group_discard(
            tournament_id,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        await self.parse_receive(data)

    # ON EVENTS

    async def parse_receive(self, data):
        if 'event' in data:
            if data['event'] == 'load_lobby':
                await self.on_load_lobby()
            elif data['event'] == 'tournament_start':
                await self.on_tournament_start()
            elif data['event'] == 'player_key_down':
                await self.on_player_key_down(data)
            elif data['event'] == 'player_key_up':
                await self.on_player_key_up(data)
            else:
                print('NO SUCH EVENT')
        else:
            print('Missing "event" key in data dictionary')

    async def on_load_lobby(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        
        await self.send(text_data=json.dumps({
            'type': 'load_lobby',
            'arg': self.tournament_manager.get_room(tournament_id)
        }))

    async def on_tournament_start(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        
        print('TOURNAMENT STARTING...')
        
        if self.tournament_manager.start_tournament(tournament_id):
            await self.send_tournament_start()

        players = self.tournament_manager.get_players_turn(tournament_id)

        await self.send_set_position(players)

        game = self.tournament_manager.get_room(tournament_id)['game_state']

        game.is_running = True
        game.ball.x_vel = game.ball.speed
        asyncio.create_task(self.game_loop())

    async def on_player_key_down(self, data):
        print(f'KEY DOWN {data}')
    
    async def on_player_key_up(self, data):
        print(f'KEY UP {data}')

    # EMIT EVENTS 

    async def send_players_update(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']

        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'players_update',
                'arg': self.tournament_manager.get_printable_room(tournament_id) 
            }
        )

    async def players_update(self, event):
        # Send the players list to the client
        await self.send(text_data=json.dumps({
            'type': 'players_update',
            'arg': event['arg'],
        }))

    async def send_tournament_start(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']

        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'tournament_start',
                'arg': self.tournament_manager.get_printable_room(tournament_id)
            }
        )
    
    async def tournament_start(self, event):
        await self.send(text_data=json.dumps({
            'type': 'tournament_start',
            'arg': event['arg']
        }))

    async def send_set_position(self, players):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']

        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'set_position',
                'arg': players
            }
        )

    async def set_position(self, event):
        await self.send(text_data=json.dumps({
            'type': 'set_position',
            'arg': event['arg']
        }))

    async def send_game_state(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        game = self.tournament_manager.get_room(tournament_id)['game_state']

        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'game_state',
                'arg': {
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
            }
        )

    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'arg': event['arg'] 
        }))

    # GAME HANDLER
	
    async def get_update_lock(self):
        if self.update_lock is None:
            self.update_lock = asyncio.Lock()
        return self.update_lock
        
    async def game_loop(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        game = self.tournament_manager.get_room(tournament_id)['game_state']
        
        async with await self.get_update_lock():
            while game.is_running == True:
                await game.update()
                await self.send_game_state()
                await asyncio.sleep(tick_duration)
	# 		# if (game.someone_won == True):
	# 		# 	await self.end_game('get_winner')  