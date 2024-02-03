from django.shortcuts import render
from django.http import HttpResponse

def gamemode_selection(request):
	return render(request, 'gamemode_selection.html')
