import json
from django.shortcuts import render
from django.http import JsonResponse
from .models import Tournament
from django.views.decorators.csrf import csrf_exempt
def play_tournament(request):
    return render(request, 'play_tournament.html')

def create_local(request):
    return render(request, 'create_local.html')

def current_state(request):
    return render(request, 'current_state.html')

def create_online(request):
    return render(request, 'create_online.html')

def join_online(request):
    return render(request, 'join_online.html')

@csrf_exempt
def api_tournament(request):
    if request.method == 'GET':
        tournaments = Tournament.objects.all()
        tournament_list = [tournament.to_dict() for tournament in tournaments]
        return JsonResponse(tournament_list, safe=False)

    elif request.method == 'POST':
        data = json.loads(request.body)
        try:
            tournament = Tournament.objects.create(
                name=data['tournament_name']
            )
            return JsonResponse({'id': tournament.id}, status=201)
        except KeyError:
            return JsonResponse({'error': 'invalid format'}, status=400)   