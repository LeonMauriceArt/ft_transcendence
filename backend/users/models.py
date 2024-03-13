from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.contrib.sessions.models import Session as BaseSession

DEFAULT = "-"

class CustomUserManager(BaseUserManager):
    def _create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("You need to provide a username")
        user = self.model(username = username, **extra_fields)
        user.set_password(password)
        user.save(user=self._db)
        return user

class UserProfile(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=255, unique=True, default="")
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    last_active = models.DateTimeField(default=timezone.now)
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.jpg')

    date_joined = models.DateTimeField(default=timezone.now)
    first_name = models.CharField(max_length=255, default="")
    last_name = models.CharField(max_length=255, default="")
    games_won = models.IntegerField(default=0)
    alias = models.CharField(max_length=255, default="")

    objects = CustomUserManager()

    USERNAME_FIELD="username"

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_admin

class UserSession(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=32)

class Friendship(models.Model):
    created = models.DateTimeField(auto_now_add=True, editable=False)
    creator = models.ForeignKey(UserProfile, related_name="friendship_creator_set", on_delete=models.CASCADE)
    friend = models.ForeignKey(UserProfile, related_name="friend_set", on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=(('pending', 'Pending'), ('accepted', 'Accepted')), default='pending')

    class Meta:
        unique_together = ('creator', 'friend')

    def __str__(self):
        return f"{self.creator.username} & {self.friend.username} - {self.status}"


class MatchHistory(models.Model):
	user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='match_history')
	date = models.DateTimeField(default=timezone.now)
	player_one = models.CharField(max_length=255, default="player_one")
	player_two = models.CharField(max_length=255, default="player_two")
	player_one_score = models.IntegerField(default=0)
	player_two_score = models.IntegerField(default=0)
	winner = models.CharField(max_length=255, default="winner")

