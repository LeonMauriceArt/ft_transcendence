from django.shortcuts import render
from django.http import HttpResponse

def play(request):
	return render(request, 'play.html')

def create_game(request):
	return render(request, 'create_game.html')

def practice(request):
	return render(request, 'practice.html')