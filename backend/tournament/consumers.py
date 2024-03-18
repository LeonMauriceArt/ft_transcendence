import json
from copy import deepcopy
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer

from pong_game.gamelogic import GameState

from enum import Enum

tick_rate = 60
tick_duration = 1 / tick_rate

class TournamentState(Enum):
    LOBBY = "LOBBY"
    DEMI_FINALS1 = "DEMI_FINALS1"
    DEMI_FINALS2 = "DEMI_FINALS2"
    FINALS = "FINALS"

class PlayerState(Enum):
    PENDING = "PENDING"
    WINNER = "WINNER" 
    LOSER = "LOSER"
    LEFT = "LEFT"

class TournamentManager():
    def __init__(self):
        self.rooms = {}
    
    def create_or_add_player_to_room(self, roomId, player, alias):
        current_room = self.rooms.get(roomId, {})

        if current_room and len(current_room.get('players', [])) >= 4:
            return False

        if not current_room:
            current_room = {
                'n_ready': 0,
                'state': TournamentState.LOBBY.name,
                'owner': player,
                'players': [player],
                'aliases': [alias],
                'players_state': [PlayerState.PENDING.name, PlayerState.PENDING.name, PlayerState.PENDING.name, PlayerState.PENDING.name],
                'game_state': GameState()
            }
            self.rooms[roomId] = current_room
        else:
            if player in current_room['players']:
                return False
            current_room['players'].append(player)
            current_room['aliases'].append(alias)
            self.rooms[roomId] = current_room

        return True

    def remove_player_from_room(self, roomId, player, alias):
        current_room = self.rooms.get(roomId, {})

        if current_room and player in current_room.get('players', []):

            current_room['players'].remove(player)
            current_room['aliases'].remove(alias)

            if len(current_room['players']) == 0:
                del self.rooms[roomId]
                return
            elif player == current_room.get('owner'):
                current_room['owner'] = current_room['players'][0]

            self.rooms[roomId] = current_room

    def get_room(self, roomId):
        return self.rooms.get(roomId, [])
    
    def remove_room(self, roomId):
        if self.get_room(roomId):
            del self.rooms[roomId]

    def get_printable_room(self, roomId):
        room = deepcopy(self.get_room(roomId))
        if not room:
            return {}
        del room['game_state']
        return room

    def start_tournament(self, roomId):
        room = self.get_room(roomId)

        if room and len(room.get('players', [])) != 4:
            return False
        
        room['state'] = TournamentState.DEMI_FINALS1.name
        return True
    
    def get_players_turn(self, roomId):
        players = []
        room = self.get_room(roomId)
        if not room:
            return 
        if (room['state'] == TournamentState.DEMI_FINALS1.name):
            players.append(room['aliases'][0])
            players.append(room['aliases'][1])
        if (room['state'] == TournamentState.DEMI_FINALS2.name):
            players = []
            players.append(room['aliases'][2])
            players.append(room['aliases'][3])
        if (room['state'] == TournamentState.FINALS.name):
            players = []
            for (index, value) in enumerate(room['players_state']):
                if value == PlayerState.WINNER.name:
                    players.append(room['aliases'][index])

        return players

    def next_turn(self, roomId, winnerIdx, looserIdx):
        room = self.get_room(roomId)

        if room['state'] == TournamentState.FINALS.name:
            return False
        
        if room['state'] == TournamentState.DEMI_FINALS1.name:
            room['players_state'][winnerIdx] = PlayerState.WINNER.name
            room['players_state'][looserIdx] = PlayerState.LOSER.name

            room['state'] = TournamentState.DEMI_FINALS2.name
            room['game_state'] = GameState()
        elif room['state'] == TournamentState.DEMI_FINALS2.name:
            room['players_state'][winnerIdx + 2] = PlayerState.WINNER.name
            room['players_state'][looserIdx + 2] = PlayerState.LOSER.name

            room['state'] = TournamentState.FINALS.name
            room['game_state'] = GameState()

        return True

    def get_player_index(self, roomId, player):
        try:
            return self.get_room(roomId)['players'].index(player)
        except:
            return -1
            

class TournamentConsumer(AsyncWebsocketConsumer):
    tournament_manager = TournamentManager()
    update_lock = None

    async def connect(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        player = self.scope['user'].username
        alias = self.scope['user'].alias
        # Join room group
        await self.channel_layer.group_add(
            tournament_id,
            self.channel_name
        )

        if self.tournament_manager.create_or_add_player_to_room(tournament_id, player, alias):
            await self.accept()
        else:
            await self.close()
        
        await self.send_players_update()

    async def disconnect(self, close_code):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        player = self.scope['user'].username
        alias = self.scope['user'].alias
        room = self.tournament_manager.get_room(tournament_id)

        if room:
            if room['state'] == TournamentState.LOBBY.name:
                self.tournament_manager.remove_player_from_room(tournament_id, player, alias)
                await self.send_players_update()
            else:
                idx = self.tournament_manager.get_player_index(tournament_id, player)
                if idx > -1:
                    player_state = room['players_state'][idx]
                    if player_state != PlayerState.LOSER.name:
                        room['game_state'].is_running = False
                        self.tournament_manager.remove_room(tournament_id)
                        await self.send_tournament_end("Tournament has ended because a remaining player disconnected :( ")

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
            elif data['event'] == 'load_playground':
                await self.on_load_playground()
            elif data['event'] == 'tournament_start':
                await self.on_tournament_start()
            elif data['event'] == 'game_start':
                await self.on_game_start()
            elif data['event'] == 'player_key_down':
                await self.on_player_key_down(data)
            elif data['event'] == 'player_key_up':
                await self.on_player_key_up(data)
        else:
            print('Missing "event" key in data dictionary')

    async def on_load_lobby(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        
        await self.send(text_data=json.dumps({
            'type': 'load_lobby',
            'arg': self.tournament_manager.get_printable_room(tournament_id)
        }))

    async def on_load_playground(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']

        if self.tournament_manager.start_tournament(tournament_id):
            await self.send_load_playground()
        else:
            return
        
    async def on_tournament_start(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        user = self.scope['user'].username
        room = self.tournament_manager.get_room(tournament_id)

        room['n_ready'] += 1

        if room['n_ready'] < 4:
            return
        
        await self.send_tournament_start()

        players = self.tournament_manager.get_players_turn(tournament_id)
        
        await self.send_set_position(players, room['state'])

    async def on_game_start(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        game = self.tournament_manager.get_room(tournament_id)['game_state']
        players = self.tournament_manager.get_players_turn(tournament_id)
        
        await self.send_game_start(players)

        game.is_running = True
        game.ball.x_vel = game.ball.speed
        asyncio.create_task(self.game_loop())

    async def on_player_key_down(self, data):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        game = self.tournament_manager.get_room(tournament_id)['game_state']

        await game.set_player_movement(data['player'], True, data['direction'])

    async def on_player_key_up(self, data):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        game = self.tournament_manager.get_room(tournament_id)['game_state']

        await game.set_player_movement(data['player'], False, False)

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

    async def send_load_playground(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id'] 

        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'load_playground',
                'arg': {}
            }
        )
    
    async def load_playground(self, event):
        await self.send(text_data=json.dumps({
            'type': 'load_playground',
            'arg': event['arg']
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

    async def send_set_position(self, players, state):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']

        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'set_position',
                'arg': {
                    'players': players,
                    'state': state
                }
            }
        )

    async def set_position(self, event):
        await self.send(text_data=json.dumps({
            'type': 'set_position',
            'arg': event['arg']
        }))

    async def send_game_start(self, players):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']

        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'game_start',
                'arg': {
                    'player1': players[0],
                    'player2': players[0]
                }
            }
        )

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_start',
            'arg': event['arg']
        }))

    async def send_game_end(self, winner, looser, state):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        
        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'game_end',
                'arg': {
                    'winner': winner,
                    'looser': looser,
                    'state': state
                }
            }
        )

    async def game_end(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_end',
            'arg': event['arg']
        }))

    async def send_tournament_end(self, message):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']

        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'tournament_end',
                'arg': message
            }
        )
    
    async def tournament_end(self, event):
        await self.send(text_data=json.dumps({
            'type': 'tournament_end',
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
            if game.someone_won == True:
                await self.end_game()

    async def end_game(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        game = self.tournament_manager.get_room(tournament_id)['game_state']
        players = self.tournament_manager.get_players_turn(tournament_id)
    
        game.is_running = False

        if game.players[0].score >= game.winning_score:
            await self.send_game_end(players[0], players[1], self.tournament_manager.get_room(tournament_id)['state'])
            keep = self.tournament_manager.next_turn(tournament_id, 0, 1)
        elif game.players[1].score >= game.winning_score:
            await self.send_game_end(players[1], players[0], self.tournament_manager.get_room(tournament_id)['state'])
            keep = self.tournament_manager.next_turn(tournament_id, 1, 0)
        
        await asyncio.sleep(5)

        if keep:
            players = self.tournament_manager.get_players_turn(tournament_id)
            await self.send_set_position(players, self.tournament_manager.get_room(tournament_id)['state'])
        else:
            self.tournament_manager.remove_room(tournament_id)
            await self.send_tournament_end("Tournament has ended !")