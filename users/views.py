from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import UserProfile
import json

def user(request):
	user_profiles = UserProfile.objects.all()
	template = loader.get_template('user.html')
	context = { 'user_profiles': user_profiles
	}
	return HttpResponse(template.render(context, request))

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
# dik

