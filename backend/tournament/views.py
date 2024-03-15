import json
import uuid

from django.shortcuts import render
from django.shortcuts import get_object_or_404

from django.http import JsonResponse
from django.utils.timezone import now, timedelta

from users.models import UserProfile, Friendship
from .models import TournamentRequest

# TEMPLATES

def tournament_page(request):
    return render(request, 'tournament_page.html')

def create_online_page(request):
    return render(request, 'create_online_page.html')

def tournament_requests_page(request):
    invitations = TournamentRequest.objects.filter(receiver=request.user)

    return render(request, 'tournament_requests_page.html', {'invitations': invitations })

def invite_page(request):
    friends = Friendship.objects.filter(creator=request.user, status='accepted').select_related('friend')
    other_friends = Friendship.objects.filter(friend=request.user, status='accepted').select_related('creator')
    
    friend_list = []
    
    for friendship in friends:
        avatar_url = friendship.friend.avatar.url if friendship.friend.avatar else None
        friend_list.append((friendship.friend.username, avatar_url))
    
    for friendship in other_friends:
            avatar_url = friendship.creator.avatar.url if friendship.creator.avatar else None
            friend_list.append((friendship.creator.username, avatar_url))

    return render(request, 'invite_page.html', {'friends': friend_list})

def playground_page(request):
    return render(request, 'playground_page.html')
    
# API

def create_tournament(request):
    tournament_id = str(uuid.uuid4())

    return JsonResponse({ 'tournament_id': tournament_id })

def tournament_requests(request):
    data = json.loads(request.body.decode('utf-8'))

    if (request.method == 'POST'):
        to_invite = data.get('to_invite')
        tournament_id = data.get('tournament_id')
        sender = request.user

        receiver = get_object_or_404(UserProfile, username=to_invite)

        existing_request = TournamentRequest.objects.filter(sender=sender, receiver=receiver, tournament_id=tournament_id).first()

        if existing_request:
            return JsonResponse({'status': 'error', 'message': 'Invitation already sent for this tournament'})

        TournamentRequest.objects.create(sender=sender, receiver=receiver, tournament_id=tournament_id)

        return JsonResponse({'status': 'success', 'message': 'Invitation sent successfully'})
    if (request.method == 'DELETE'):
        tournament_id = data.get('tournament_id')
        
        tournament_requests = TournamentRequest.objects.filter(receiver=request.user, tournament_id=tournament_id)
        tournament_requests.delete()

        return JsonResponse({'status': 'success', 'message': 'Requests were succesfully deleted '})