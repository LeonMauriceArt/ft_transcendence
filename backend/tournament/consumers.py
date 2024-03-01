import json
from channels.generic.websocket import AsyncWebsocketConsumer

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
                'owner': player,
                'players': [player],
            }
            self.rooms[roomId] = current_room
        else:
            print('ADDING TO THE CURRENT ROOM')
            current_room['players'].append(player)
            self.rooms[roomId] = current_room

        print(f'PLAYER ADDED TO ROOM, ROOM NOW {self.rooms[roomId]}')
        return True

    def remove_player_from_room(self, roomId, player):
        current_room = self.rooms.get(roomId, {})

        if current_room and player in current_room.get('players', []):
            print(f'REMOVING PLAYER {player} FROM ROOM {roomId}')

            current_room['players'].remove(player)

            if len(current_room['players']) == 0:
                print(f'REMOVING ROOM CAUSE NOW EMPTY...')
                del self.rooms[roomId]
            elif player == current_room.get('owner'):
                current_room['owner'] = current_room['players'][0]

            self.rooms[roomId] = current_room

            print(f'PLAYER REMOVED FROM ROOM, ROOM NOW => {self.rooms[roomId]}')

    def get_room(self, roomId):
        return self.rooms.get(roomId, [])

class TournamentConsumer(AsyncWebsocketConsumer):
    tournament_manager = TournamentManager()

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
        # Handle received data as needed
        await self.send(text_data=json.dumps({'message': 'Received message'}))

    # EMIT EVENTS 

    async def send_players_update(self):
        tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        
        # Broadcast the current players list to all clients in the group
        await self.channel_layer.group_send(
            tournament_id,
            {
                'type': 'players_update',
                'arg': self.tournament_manager.get_room(tournament_id),
            }
        )

    async def players_update(self, event):
        # Send the players list to the client
        await self.send(text_data=json.dumps({
            'type': 'players_update',
            'arg': event['arg'],
        }))