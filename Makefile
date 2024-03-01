
DOCKER_COMPOSE = ./docker-compose.yml

build: down
	docker compose -f $(DOCKER_COMPOSE) build

buildnocache:
	docker compose -f $(DOCKER_COMPOSE) build --no-cache

status:
	@echo "\033[32m---DOCKER COMPOSE PROCESSES---\033[0m"
	docker compose -f $(DOCKER_COMPOSE) ps
	@echo "\033[32m---DOCKER COMPOSE IMAGES---\033[0m"
	docker compose -f $(DOCKER_COMPOSE) images

logs:
	docker compose -f $(DOCKER_COMPOSE) logs -f

up: 
	docker compose -f $(DOCKER_COMPOSE) up --build

detached:
	docker compose -f $(DOCKER_COMPOSE) up -d

down:
	docker compose -f $(DOCKER_COMPOSE) down

migrations:
	docker compose -f $(DOCKER_COMPOSE) exec web python3 manage.py makemigrations
	docker compose -f $(DOCKER_COMPOSE) exec web python3 manage.py migrate

collectstatic:
	docker compose -f $(DOCKER_COMPOSE) exec web python3 manage.py collectstatic --noinput

prune:
	docker compose -f $(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	docker system prune -a -f

re:	down buildnocache