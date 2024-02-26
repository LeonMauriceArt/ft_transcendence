from django.db import models

# This class is not meant to stay, just here to be able to dev the tournament system without actually having merged complete user part.

class TournamentPlayer(models.Model):
    name=models.CharField(max_length=10)

class Tournament(models.Model):
    name=models.CharField(max_length=20)
    players=models.ManyToManyField(TournamentPlayer)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'players_count': self.players.count()
        }