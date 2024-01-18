from django.shortcuts import render
from django.http import HttpResponse

def home(request):
	return render(request, 'home.html', {'content': 'This is the home page'})

def game(request):
	return render(request, 'game.html', {'content': 'This is the game page'})
