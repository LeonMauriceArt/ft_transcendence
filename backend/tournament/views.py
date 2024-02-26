import json
from django.shortcuts import render
from django.http import JsonResponse
from .models import Tournament, TournamentPlayer
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

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

def pre_lobby(request):
    return render(request, 'pre_lobby.html')

def lobby(request):
    return render(request, 'lobby.html')

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
    elif request.method == 'DELETE':
        try:
            Tournament.objects.all().delete()
            return JsonResponse({'success': True, 'message': 'All tournaments deleted successfully.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error deleting tournaments: {str(e)}'}, status=500)

@csrf_exempt
def api_tournament_arg(request, tournament_id):
    if request.method == 'PUT':
        data = json.loads(request.body)
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            player = TournamentPlayer.objects.create(
                name=data['aliase']
            )
            if player not in tournament.players.all() and tournament.players.count() < 4:
                tournament.players.add(player)
                return JsonResponse({ 'success': True, 'message': 'Player joined the lobby'})
            else:
                return JsonResponse({ 'success': False, 'message': 'Lobby full'}, status=400)
        except (Tournament.DoesNotExist, KeyError):
            return JsonResponse({'error': 'cant join tournament'}, status=400)
    elif request.method == 'GET':
        tournament = get_object_or_404(Tournament, id=tournament_id)
        return JsonResponse(tournament.to_dict(), safe=False)