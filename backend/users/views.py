from django.shortcuts import render
from django.db import IntegrityError
from django.http import HttpResponse
from django.template import loader
from .models import UserProfile
import json

def check_login(request):
     if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if UserProfile.objects.filter(login=data).exists():
             return HttpResponse(status=409)
        else:
            return HttpResponse(status=200)

def user(request):
	user_profiles = UserProfile.objects.all().values
	template = loader.get_template('user.html')
	context = { 'user_profiles': user_profiles
	}
	return HttpResponse(template.render(context, request))

def login_form(request):
     return render(request, 'login.html')

def registration_form(request):
     return render(request, 'register.html')

def submit_register(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        login = data.get('login')
        password = data.get('password')
        firstName = data.get('firstName')
        lastName = data.get('lastName')

        try:
            user_profile = UserProfile(login=login, firstName=firstName,lastName=lastName,password=password)
            user_profile.save()
            return HttpResponse(status=201)
        except IntegrityError as e:
            return HttpResponse(status=400)
    else:
         return HttpResponse(status=500)



def submit_login(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        login = data.get('login')
        password = data.get('password')

        try:
             user_profile = UserProfile.objects.get(login=login, password=password)
             return HttpResponse(status=200)
        except UserProfile.DoesNotExist:
             return HttpResponse(status=401)
    else:
         return HttpResponse(status=400)


