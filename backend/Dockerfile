FROM python:3.8

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

COPY requirements.txt /code/

RUN pip install --upgrade pip && pip install -r requirements.txt

RUN pip install -U 'Twisted[tls,http2]' && mkdir /usr/src/daphne_sock

COPY . /code/

# RUN daphne -u /usr/src/daphne.sock -p 8000 -b 0.0.0.0 django_project.asgi:application

# CMD ["daphne", "django_project.asgi:application", "-u", "/usr/src/daphne_sock/daphne.sock"]
