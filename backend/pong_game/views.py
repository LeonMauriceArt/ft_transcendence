from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

def play(request):
	return render(request, 'play.html')

@login_required
def quickmatch(request):
	return render(request, 'quickmatch.html')
	pass

def join_game(request):
	return render(request, 'join_game.html')

def create_game(request):
	return render(request, 'create_game.html')

def practice(request):
	return render(request, 'game_practice.html')

def local(request):
	return render(request, 'game_local.html')