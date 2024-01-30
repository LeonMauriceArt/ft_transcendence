from django.shortcuts import render
from django.http import HttpResponse

def game(request):
	return render(request, 'gamemodes.html')
