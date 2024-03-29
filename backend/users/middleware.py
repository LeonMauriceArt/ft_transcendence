from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.contrib.sessions.models import Session

class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated:
            User = get_user_model()
            User.objects.filter(pk=request.user.pk).update(last_active=now())
        return response

