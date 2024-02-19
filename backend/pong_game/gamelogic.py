import asyncio

class GameLogic:
    def __init__(self):
        self.players = {}

    async def handle_player_input(self, player_id, input_data):
        pass

    async def update_game_state(self):
        pass

class Player:
    def __init__(self, player_id):
        self.player_id = player_id
        self.score = 0
