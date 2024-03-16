from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from .models import UserSession

@receiver(user_logged_in)
def on_user_logged_in(sender, user, request, **kwargs):
	current_session_key = request.session.session_key
	UserSession.objects.create(user=user, session_key=current_session_key)

@receiver(user_logged_out)
def on_user_logged_out(sender, user, request, **kwargs):
	UserSession.objects.filter(user=user).delete()
