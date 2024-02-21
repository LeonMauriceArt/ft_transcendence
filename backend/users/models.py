from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

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

    date_joined = models.DateTimeField(default=timezone.now)
    first_name = models.CharField(max_length=255, default="")
    last_name = models.CharField(max_length=255, default="")
    games_won = models.IntegerField(default=0)
    # avatar = models.ImageField(upload_to="avatars")

    objects = CustomUserManager()

    USERNAME_FIELD="username"

    def __str__(self):
        return self.username
    
    def has_perm(self, perm, obj=None):
        return self.is_admin
        
