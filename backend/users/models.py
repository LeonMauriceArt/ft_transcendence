from django.db import models

DEFAULT = "-"

class UserProfile(models.Model):
    login = models.CharField(max_length=255)
    password = models.CharField(max_length=128)
<<<<<<< HEAD:users/models.py
    firstName = models.CharField(max_length=255, default="")
    lastName = models.CharField(max_length=255, default="")
=======
    firstName = models.CharField(max_length=255)
    lastName = models.CharField(max_length=255)
>>>>>>> cef4db41275880a6c2accde5fc80df5bb3bcdb2c:backend/users/models.py

