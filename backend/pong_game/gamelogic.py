import asyncio

game_area_width = 70
game_area_height = 50
paddle_width = 5
paddle_height = 20
player_speed = 1
winning_score = 3

class GameState:
	class Ball:
		def __init__(self):
			self.x = 0
			self.y = 0
			self.radius = 2
			self.speed = 0
			self.x_vel = 0
			self.y_vel = 0
			self.color = 0xffffff
		
		def __str__(self):
			return f"Ball position: ({self.x}, {self.y}), Ball vel: {self.x_vel}x{self.y_vel}, Color: {self.color}"
		
		def handle_ball_collision(player_one, player_two):
			if self.y + self.radius > game_area_height :
				self.y = game_area_height - self.radius
				self.y_vel *= -1
			if self.y - self.radius < game_area_height * -1 :
				self.y = game_area_height * -1 + self.radius
				self.y_vel *= -1
			if self.x_vel < 0 :
				if self.y <= player_one.y + paddle_height / 2 and self.y >= player_one.y - paddle_height / 2 and self.x > player_one.x :
					if self.x - self.radius <= player_one.x + paddle_width / 2 :
						self.x_vel *= -1
						middle_y = player_one.y
						difference_in_y = middle_y - self.y
						reduction_factor = (paddle_height / 2) / self.speed
						new_y_vel = difference_in_y / reduction_factor
						self.y_vel = -1 * new_y_vel
			else :
				if self.y <= player_two.y + paddle_height / 2 and self.y >= player_two.y - paddle_height / 2 and self.x < player_two.x :
					if self.x + self.radius >= player_two.x - paddle_width / 2 :
						self.x_vel *= -1
						middle_y = player_two.y
						difference_in_y = middle_y - self.y
						reduction_factor = (paddle_height / 2) / self.speed
						new_y_vel = difference_in_y / reduction_factor
						self.y_vel = -1 * new_y_vel

		def move(self):
			self.handle_ball_collision()
			self.x += self.x_vel
			self.y += self.y_vel
		
		def reset(self):
			self.x = 0
			self.y = 0

	class Player:
		def __init__(self, position):
			if position == 1:
				self.x = (game_area_width * -1) + 10
			else
				self.x = game_area_width - 10
			self.y = 0
			self.score = 0
			self.is_moving = False
			self.up = False
		def __str__(self):
            return f"Player position: ({self.x}, {self.y}), Paddle size: {self.paddle_width}x{self.paddle_height}, Score: {self.score}"

		def move(self):
			if self.is_moving:
				if self.up :
					if ((self.y + paddle_height / 2) + player_speed <= game_area_height)
						self.y += player_speed;
				else
					if ((self.y - paddle_height / 2) - player_speed > game_area_height * -1)
						self.y -= player_speed;
	
		def reset(self):
			self.y = 0
		
		def score_point(self):
			self.score += 1

    def __init__(self):
		self.ball = self.Ball()
		self.players = [self.Player(1), self.Player(2)]
		self.is_running = False

    async def set_player_movement(self, player_pos, is_moving, direction):
        if player_pos == 1 :
			self.players[0].is_moving = is_moving
			if direction :
				self.players[0].up = direction
		else
			self.players[1].is_moving = is_moving
			if direction :
				self.players[1].up = direction

	async def handle_scores(self):
		if ball.x >= game_area_width :
			ball.reset()
		else if ball.x <= -game_area_width :
			ball.reset()

	async def update(self):
		self.players[0].move()
		self.players[1].move()
		self.ball.move()
		 
