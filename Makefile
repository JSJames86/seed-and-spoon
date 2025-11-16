.PHONY: help install dev test format lint clean migrate shell superuser run celery

help:  ## Show this help message
	@echo "Seed & Spoon Backend - Development Commands"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install all dependencies
	python3 -m venv venv
	. venv/bin/activate && pip install --upgrade pip
	. venv/bin/activate && pip install -r requirements.txt

dev:  ## Activate virtual environment
	@echo "Run: source venv/bin/activate"

migrate:  ## Run database migrations
	. venv/bin/activate && python manage.py migrate

makemigrations:  ## Create new migrations
	. venv/bin/activate && python manage.py makemigrations

shell:  ## Open Django shell
	. venv/bin/activate && python manage.py shell

superuser:  ## Create Django superuser
	. venv/bin/activate && python manage.py createsuperuser

run:  ## Run development server
	. venv/bin/activate && python manage.py runserver

celery:  ## Start Celery worker
	. venv/bin/activate && celery -A seed_spoon worker -l info

celery-beat:  ## Start Celery beat scheduler
	. venv/bin/activate && celery -A seed_spoon beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler

test:  ## Run tests
	. venv/bin/activate && pytest

test-cov:  ## Run tests with coverage
	. venv/bin/activate && pytest --cov=. --cov-report=html --cov-report=term-missing

format:  ## Format code with black and isort
	. venv/bin/activate && black .
	. venv/bin/activate && isort .

lint:  ## Run linters
	. venv/bin/activate && flake8 .
	. venv/bin/activate && mypy .

check:  ## Run Django system checks
	. venv/bin/activate && python manage.py check

clean:  ## Clean up Python cache files
	find . -type f -name '*.pyc' -delete
	find . -type d -name '__pycache__' -delete
	find . -type d -name '*.egg-info' -exec rm -rf {} +
	find . -type d -name '.pytest_cache' -exec rm -rf {} +
	find . -type d -name '.mypy_cache' -exec rm -rf {} +
	rm -rf htmlcov/
	rm -rf .coverage

setup-db:  ## Setup PostgreSQL database (requires psql)
	@echo "Creating database..."
	psql -U postgres -c "CREATE DATABASE seed_spoon;"
	psql -U postgres -c "CREATE USER seed_spoon_user WITH PASSWORD 'your_password';"
	psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE seed_spoon TO seed_spoon_user;"
	@echo "Database created! Update .env with DB credentials."

requirements-freeze:  ## Freeze current requirements
	. venv/bin/activate && pip freeze > requirements.txt

all: install migrate superuser run  ## Install, migrate, create superuser, and run
