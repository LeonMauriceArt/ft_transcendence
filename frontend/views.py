from django.shortcuts import render
from django.http import HttpResponse

def index(request):
	return render(request, 'index.html', {'content': 'This is the home page'})

def user(request):
	return render(request, 'user.html', {'content': 'This is where the user does stuff'})

def welcome(request):
	return render(request, 'welcome.html', {'content': 'In this website you can compete at pong with other people'})