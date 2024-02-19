from django.shortcuts import render
from django.http import HttpResponse

def play(request):
	return render(request, 'play.html')

def quickmatch(request):
	return render(request, 'quickmatch.html')

def join_game(request):
	return render(request, 'join_game.html')

def create_game(request):
	return render(request, 'create_game.html')

def practice(request):
	return render(request, 'game_practice.html')

def local(request):
	return render(request, 'game_local.html')