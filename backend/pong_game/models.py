from django.db import models
from django.utils import timezone

class MatchHistory(models.Model):
	match_date = models.DateTimeField(default=timezone.now)
	player_one = models.CharField(max_length=255, default="player_one")
	player_two = models.CharField(max_length=255, default="player_two")
    player_one_score = models.IntegerField(default=0)
    player_two_score = models.IntegerField(default=0)
	winner = models.CharField(max_length=255, default="winner")

