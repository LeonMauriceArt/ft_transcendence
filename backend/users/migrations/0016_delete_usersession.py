# Generated by Django 3.2.24 on 2024-03-16 16:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0015_auto_20240316_1508'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UserSession',
        ),
    ]