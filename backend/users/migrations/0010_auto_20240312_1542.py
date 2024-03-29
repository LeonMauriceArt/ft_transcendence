# Generated by Django 3.2.24 on 2024-03-12 15:42

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sessions', '0001_initial'),
        ('users', '0009_matchhistory'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='nickName',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='alias',
            field=models.CharField(default=models.CharField(default='', max_length=255, unique=True), max_length=255, unique=True),
        ),
        migrations.CreateModel(
            name='UserSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='sessions.session')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
