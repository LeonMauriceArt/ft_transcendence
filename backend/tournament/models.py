from django.db import models
from users.models import UserProfile 

class TournamentRequest(models.Model):
    sender = models.ForeignKey(UserProfile, related_name="tournament_requests_sent", on_delete=models.CASCADE)
    receiver = models.ForeignKey(UserProfile, related_name="tournament_requests_received", on_delete=models.CASCADE)
    tournament_id = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username} for {self.tournament.name} - {self.tournament_id}"