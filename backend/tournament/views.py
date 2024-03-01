import json
import uuid
from django.shortcuts import render
from django.http import JsonResponse

# TEMPLATES

def tournament_page(request):
    return render(request, 'tournament_page.html')

def create_local_page(request):
    return render(request, 'create_local_page.html')

def create_online_page(request):
    return render(request, 'create_online_page.html')

def tournament_requests_page(request):
    return render(request, 'tournament_requests_page.html')

# API

def create_tournament(request):
    tournament_id = str(uuid.uuid4())

    return JsonResponse({ 'tournament_id': tournament_id }) 