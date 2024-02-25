from django.shortcuts import render

def play_tournament(request):
    return render(request, 'play_tournament.html')

def create_local(request):
    return render(request, 'create_local.html')

def current_state(request):
    return render(request, 'current_state.html')