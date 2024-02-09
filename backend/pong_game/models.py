from django.db import models

class GameInstance(models.Model):
	game_id = models.IntegerField();
	
	CLASSIC = 'CL'
	EXTRA = 'EX'
	GAME_TYPES = [
		(CLASSIC, 'Classic'),
		(EXTRA, 'EXTRA'),
	]
	game_type = models.CharField(
		max_length=2,
		choices=GAME_TYPES,
		default=CLASSIC,
	)
	
	#everything needed for a game instance config here
