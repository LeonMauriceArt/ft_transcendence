# Generated by Django 3.2 on 2024-02-05 16:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='firstName',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='lastName',
            field=models.CharField(default='', max_length=255),
        ),
    ]
