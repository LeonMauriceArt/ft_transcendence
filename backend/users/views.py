from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect, get_object_or_404
from django import forms
from .forms import RegistrationForm, LoginForm, ModifyForm
from .models import UserProfile, Friendship, MatchHistory, UserSession
from django.template import loader
from django.http import HttpResponse, JsonResponse
from django.utils.timezone import now, timedelta
from django.utils import timezone
from django.template.loader import render_to_string
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.models import Session
from django.views.decorators.csrf import csrf_protect, csrf_exempt

def user(request):
     user_profiles = UserProfile.objects.all().values
     template = loader.get_template('user.html')
     context = { 'user_profiles': user_profiles
     }
     return HttpResponse(template.render(context, request))

@csrf_protect
def registration_view(request):
     context = {}
     if request.method == 'POST':
          form = RegistrationForm(request.POST, request.FILES)
          if form.is_valid():
               form.save()
               raw_password = form.cleaned_data.get('password1')
               user_name = form.cleaned_data.get('username')
               user = authenticate(username=user_name, password=raw_password)
               if user is not None:
                    login(request, user)
                    return redirect ('welcome')
          else:
               context['registration_form'] = form
     else:
          form = RegistrationForm()
          context['registration_form'] = form
     return render(request, 'register.html', context)

@csrf_exempt
def logout_view(request):
    logout(request)
    if 'user_id' in request.session:
        user_id = request.session['user_id']
    return redirect('welcome')

# def auth_status(request):
#      if (request.user.is_authenticated):
#           return JsonResponse({'authenticated':True, 'username':request.user.username})
#      else:
#         return JsonResponse({'authenticated': False})

def login_view(request):
    context = {}
    if request.method == 'POST':
        form = LoginForm(request, request.POST)
        username = form.data.get('username')
        password = form.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if UserSession.objects.filter(user=user).exists():
                context['error'] = 'User already logged in.'
                return render(request, 'login.html', context)
            request.session['user_id'] = user.id
            login(request, user)
            return redirect('welcome')
        else:
            context['login_form'] = form
            context['error'] = "Invalid username or password"
    else:
        form = LoginForm()
        context['login_form'] = form
    return render(request, 'login.html', context)

@login_required
def user_profile(request, user_id):
    user_profile = get_object_or_404(UserProfile, pk=user_id)
    match_history = MatchHistory.objects.filter(user=user_profile)
    return render(request, 'user_profile.html', {
        'user_profile': user_profile,
        'match_history': match_history
    })

@login_required
def profile(request):
    win_count = 0
    loss_count = 0
    match_history = MatchHistory.objects.filter(user=request.user)
    if match_history:
        for match in match_history:
            if match.winner == request.user.username:
                win_count += 1
            else:
                loss_count += 1
    friend_requests = Friendship.objects.filter(friend=request.user, status='pending')
    friends = Friendship.objects.filter(creator=request.user, status='accepted').select_related('friend')
    other_friends = Friendship.objects.filter(friend=request.user, status='accepted').select_related('creator')
    friend_list = []
    for friendship in friends:
        is_online = now() - friendship.friend.last_active < timedelta(seconds=30)
        avatar_url = friendship.friend.avatar.url if friendship.friend.avatar else None
        friend_id = friendship.friend.id
        friend_list.append((friendship.friend.username, is_online, avatar_url, friend_id))
    for friendship in other_friends:
        is_online = now() - friendship.creator.last_active < timedelta(seconds=30)
        avatar_url = friendship.creator.avatar.url if friendship.creator.avatar else None
        friend_id = friendship.creator.id
        friend_list.append((friendship.creator.username, is_online, avatar_url, friend_id))

    context = {
        'user': request.user,
        'friend_requests': friend_requests,
        'friends': friend_list,
        'match_history': match_history,
        'win_count': win_count,
        'loss_count': loss_count
    }

    return render(request, 'profile.html', context)

@login_required
def edit_profile(request):
    if request.method == 'POST':
        print('Edit profile view')
        form = ModifyForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            if request.is_ajax():
                return JsonResponse({'success': True, 'message': 'Profile updated successfully'})
            return redirect('profile')
    else:
        form = ModifyForm(instance=request.user)

    if request.is_ajax():
        print('AJAX request')
        html = render_to_string('edit_profile.html', {'form': form}, request=request)
        return JsonResponse({'html': html})

    return render(request, 'edit_profile.html', {'form': form})
    pass

@login_required
def list_users_online(request):
	time_threshold = now() - timedelta(minutes=5)
	users_online = UserProfile.objects.filter(last_active__gte=time_threshold)
	return render(request, 'online.html', {'users_online': users_online})

@login_required
def send_friend_request(request, user_id):
    target_user = get_object_or_404(UserProfile, id=user_id)
    if request.user != target_user and not Friendship.objects.filter(creator=request.user, friend=target_user).exists() and not Friendship.objects.filter(creator=target_user, friend=request.user).exists():
        Friendship.objects.create(creator=request.user, friend=target_user, status='pending')
        print('Friend request sent!')
        return JsonResponse({'status': 'success', 'message': 'Friend request sent!'})
    else:
        print('Cannot send friend request.')
        return JsonResponse({'status': 'error', 'message': 'Cannot send friend request.'})

@login_required
def accept_friend_request(request, friendship_id):
    if request.method == 'POST':
        friendship = get_object_or_404(Friendship, id=friendship_id, friend=request.user, status='pending')
        friendship.status = 'accepted'
        friendship.save()
        return JsonResponse({'status': 'success', 'message': 'You accepted the friend request!'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})

@login_required
def username(request):
    return JsonResponse(request.user.username, safe=False)
