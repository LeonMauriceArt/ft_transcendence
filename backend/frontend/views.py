from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template import loader

def welcome(request):
	return render(request, 'welcome.html')
	# template = loader.get_template('welcome.html')
	# context = {
	# }
	# return HttpResponse(template.render(context, request))

def navbar_view(request):
	base_html = render(request, 'base.html', {'user': request.user})
	navbar_html = base_html.content.decode('utf-8').split('<div id="navbar" class="navbar">')[1].split('</div>')[0]
	return JsonResponse({'navbar_html': navbar_html})