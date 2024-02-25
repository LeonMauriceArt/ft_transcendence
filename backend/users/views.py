from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django import forms
from .forms import RegistrationForm, LoginForm, ModifyForm
from .models import UserProfile
from django.template import loader
from django.http import HttpResponse, JsonResponse

def user(request):
     user_profiles = UserProfile.objects.all().values
     template = loader.get_template('user.html')
     context = { 'user_profiles': user_profiles
     }
     return HttpResponse(template.render(context, request))

def registration_view(request):
     context = {}
     if request.method == 'POST':
          form = RegistrationForm(request.POST)
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
        form = ModifyForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = ModifyForm(instance=request.user)
    return render(request, 'edit_profile.html', {'form': form})


