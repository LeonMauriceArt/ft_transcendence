from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

def navbar(request):
	template = loader.get_template('navbar.html')
	context = {
	}
	return HttpResponse(template.render(context, request))

def welcome(request):
	template = loader.get_template('welcome.html')
	context = {
	}
	return HttpResponse(template.render(context, request))
