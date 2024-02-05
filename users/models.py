from django.db import models

class UserProfile(models.Model):
    login = models.CharField(max_length=255)
    password = models.CharField(max_length=128)
    firstName = models.CharField(max_lenght=255)
    lastName = models.CharField(max_lenght=255)

