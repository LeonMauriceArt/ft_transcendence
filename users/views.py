from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import UserProfile

def user(request):
	user_profiles = UserProfile.objects.all()
	template = loader.get_template('user.html')
	context = { 'user_profiles': user_profiles
	}
	return HttpResponse(template.render(context, request))
