from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect, get_object_or_404
from django import forms
from .forms import RegistrationForm, LoginForm, ModifyForm
from .models import UserProfile, Friendship
from django.template import loader
from django.http import HttpResponse, JsonResponse
from django.utils.timezone import now, timedelta
from django.contrib import messages

def user(request):
     user_profiles = UserProfile.objects.all().values
     template = loader.get_template('user.html')
     context = { 'user_profiles': user_profiles
     }
     return HttpResponse(template.render(context, request))

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

def logout_view(request):
     logout(request)
     return redirect('welcome')

def auth_status(request):
     if (request.user.is_authenticated):
          return JsonResponse({'authenticated':True, 'username':request.user.username})
     else:
        return JsonResponse({'authenticated': False})

def delete_users(request):
     if (request.user.is_authenticated):
          logout(request.user)
     UserProfile.objects.all().delete()
     return user(request)

def login_view(request):
    context = {}
    if request.method == 'POST':
        form = LoginForm(request, request.POST)
        username = form.data.get('username')
        password = form.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('welcome')
        else:
            context['login_form'] = form
            context['error'] = "Invalid username or password"
    else:
        form = LoginForm()
        context['login_form'] = form
    return render(request, 'login.html', context)

def profile(request):
     return render(request, 'profile.html', {'user': request.user})

def edit_profile(request):
	if request.method == 'POST':
		form = ModifyForm(request.POST, request.FILES, instance=request.user)
		if form.is_valid():
			form.save()
			return redirect('profile')
	else:
		form = ModifyForm(instance=request.user)
	return render(request, 'edit_profile.html', {'form': form})

def list_users_online(request):
	time_threshold = now() - timedelta(minutes=5)
	users_online = UserProfile.objects.filter(last_active__gte=time_threshold)
	return render(request, 'online.html', {'users_online': users_online})

def send_friend_request(request, user_id):
	if request.method == 'GET':
		target_user = get_object_or_404(UserProfile, id=user_id)
		if request.user != target_user and not Friendship.objects.filter(creator=request.user, friend=target_user).exists() and not Friendship.objects.filter(creator=target_user, friend=request.user).exists():
			Friendship.objects.create(creator=request.user, friend=target_user, status='pending')
			messages.success(request, 'Friend request sent !')
			return redirect('list_users_online')
		else:
			messages.error(request, 'Can\'t send friend request.')
			return redirect('list_users_online')
	else:
		return redirect('list_users_online')

def friend_requests_view(request):
	friend_requests = Friendship.objects.filter(friend=request.user, status='pending')
	return render(request, 'friend_requests.html', {'friend_requests': friend_requests})

def friend_list_view(request):
    friends = Friendship.objects.filter(creator=request.user, status='accepted').select_related('friend')
    other_friends = Friendship.objects.filter(friend=request.user, status='accepted').select_related('creator')
    friend_list = []
    for friendship in friends:
        is_online = now() - friendship.friend.last_active < timedelta(minutes=5)
        avatar_url = friendship.friend.avatar.url
        friend_list.append((friendship.friend.username, is_online, avatar_url))
    for friendship in other_friends:
        is_online = now() - friendship.creator.last_active < timedelta(minutes=5)
        avatar_url = friendship.creator.avatar.url
        friend_list.append((friendship.creator.username, is_online, avatar_url))

    return render(request, 'friend_list.html', {'friends': friend_list})

def accept_friend_request(request, friendship_id):
	friendship = get_object_or_404(Friendship, id=friendship_id, friend=request.user, status='pending')
	friendship.status = 'accepted'
	friendship.save()
	messages.success(request, 'You accepted the friend request !')
	return redirect('friend_requests')


