#!/bin/bash

sh -c "for i in $(seq 1 1); do echo 'Waiting for all containers to be done...'; sleep 1; done; daphne -u /usr/src/daphne_sock/daphne.sock -p 8000 -b 0.0.0.0 django_project.asgi:application" &
sleep 1
python3 manage.py makemigrations
python3 manage.py migrate &&
echo "-------------------------------------------------------------------------------------------"
echo "|Transcendence server is up and running! You can access it on address https://0.0.0.0:8433|"
echo "-------------------------------------------------------------------------------------------"

sleep infinity