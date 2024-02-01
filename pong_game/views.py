from django.shortcuts import render
from django.http import HttpResponse

def gamemodes(request):
	return render(request, 'gamemodes.html')

def gameoptions(request):
	return render(request, 'gameoptions.html')

def lobby(request):
	return render(request, 'lobby.html')

def pong_game(request):
	return render(request, 'pong_game.html')

def pong_game_practice(request):
	return render(request, 'pong_game_practice.html')
