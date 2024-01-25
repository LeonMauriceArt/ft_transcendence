from django.shortcuts import render
from django.http import HttpResponse

def game(request):
	return render(request, 'game.html', {'content': 'This is where the pong game is played'})
