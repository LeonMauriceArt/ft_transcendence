from django.db import models

DEFAULT = "-"

class UserProfile(models.Model):
    login = models.CharField(max_length=255)
    password = models.CharField(max_length=128)
    firstName = models.CharField(max_length=255, default="")
    lastName = models.CharField(max_length=255, default="")

