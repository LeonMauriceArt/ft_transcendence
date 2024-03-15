from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

def play(request):
	return render(request, 'play.html')

@login_required
def quickmatch(request):
	return render(request, 'quickmatch.html')
	pass

def practice(request):
	return render(request, 'game_practice.html')

def local(request):
	return render(request, 'game_local.html')
