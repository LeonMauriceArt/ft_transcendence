# Generated by Django 3.2 on 2024-02-26 16:01

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_userprofile_nickname'),
    ]

    operations = [
        migrations.CreateModel(
            name='Friendship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted')], default='pending', max_length=10)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friendship_creator_set', to=settings.AUTH_USER_MODEL)),
                ('friend', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friend_set', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('creator', 'friend')},
            },
        ),
    ]
