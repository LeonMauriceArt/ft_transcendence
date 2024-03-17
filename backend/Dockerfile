FROM python:3.8

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

COPY requirements.txt /code/

RUN pip install --upgrade pip && pip install -r requirements.txt
RUN pip install -U 'Twisted[tls,http2]' && mkdir /usr/src/daphne_sock
RUN pip install pillow

ENV PYTHONPATH /code/vault_db

EXPOSE 8000

COPY . /code/
RUN chmod +x ./start_up.sh
