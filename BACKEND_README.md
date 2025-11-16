# Seed & Spoon - Django Backend

A Django REST Framework backend for the Seed & Spoon food assistance platform.

## Tech Stack

- **Python 3.11+**
- **Django 5.0** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Primary database
- **PostGIS** - Geospatial database extension (optional)
- **Redis** - Caching and Celery message broker
- **Celery** - Background task processing
- **Stripe** - Payment processing
- **JWT** - Authentication

## Quick Start

### 1. Prerequisites

- Python 3.11 or higher
- PostgreSQL 12+
- Redis (for Celery and caching)
- System-level PostGIS libraries (optional, for geospatial features)

### 2. Installation

```bash
# Clone and navigate to the project
cd seed-and-spoon

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy the example environment file and update it:

```bash
cp .env.example .env
# Edit .env with your actual configuration
```

**Required environment variables:**

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=seed_spoon
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis
REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0
```

### 4. Database Setup

#### PostgreSQL Installation

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Option 1: Use the Makefile
make setup-db

# Option 2: Manually create database
psql -U postgres
CREATE DATABASE seed_spoon;
CREATE USER seed_spoon_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE seed_spoon TO seed_spoon_user;
\q
```

#### Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
# Using Makefile
make run

# Or directly
python manage.py runserver
```

Visit:
- API: http://localhost:8000/
- Admin: http://localhost:8000/admin/

## PostGIS Setup (Optional)

For geospatial features like food bank directory:

### Install System Libraries

**macOS:**
```bash
brew install gdal geos proj
```

**Ubuntu/Debian:**
```bash
sudo apt-get install gdal-bin libgdal-dev libgeos-dev libproj-dev
```

### Enable PostGIS in Database

```sql
psql -U postgres -d seed_spoon
CREATE EXTENSION postgis;
\q
```

### Update Django Settings

In `seed_spoon/settings.py`:

1. Uncomment `'django.contrib.gis'` in `INSTALLED_APPS`
2. Change database engine:
   ```python
   'ENGINE': 'django.contrib.gis.db.backends.postgis',
   ```

## Background Tasks (Celery)

### Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### Run Celery Worker

```bash
# In a separate terminal
make celery

# Or directly
celery -A seed_spoon worker -l info
```

### Run Celery Beat (Periodic Tasks)

```bash
# In another terminal
make celery-beat

# Or directly
celery -A seed_spoon beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

## Development Workflow

### Available Make Commands

```bash
make help              # Show all available commands
make install           # Install all dependencies
make migrate           # Run database migrations
make makemigrations    # Create new migrations
make run               # Run development server
make shell             # Open Django shell
make superuser         # Create superuser
make test              # Run tests
make test-cov          # Run tests with coverage
make format            # Format code with black & isort
make lint              # Run flake8 and mypy
make clean             # Remove cache files
make celery            # Start Celery worker
make celery-beat       # Start Celery beat
```

### Code Formatting

Format your code before committing:

```bash
# Auto-format with black and isort
make format

# Check linting
make lint
```

**Formatting tools configured:**
- **Black** - Code formatter (line length: 100)
- **isort** - Import sorter
- **flake8** - Linting
- **mypy** - Type checking

### Running Tests

```bash
# Run all tests
make test

# Run with coverage report
make test-cov

# Run specific test
pytest path/to/test_file.py::test_function

# Run tests matching a pattern
pytest -k "test_user"

# Run tests with markers
pytest -m "unit"  # or "integration", "slow"
```

## Project Structure

```
seed-and-spoon/
├── seed_spoon/              # Django project settings
│   ├── __init__.py         # Celery app initialization
│   ├── settings.py         # Django settings
│   ├── urls.py             # URL routing
│   ├── celery.py           # Celery configuration
│   └── wsgi.py             # WSGI application
├── core/                    # Core app (add your models here)
│   ├── migrations/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── tests.py
├── venv/                    # Virtual environment
├── requirements.txt         # Python dependencies
├── manage.py               # Django management script
├── Makefile                # Development commands
├── pyproject.toml          # Tool configurations
├── .env                    # Local environment variables
├── .env.example            # Example environment variables
└── BACKEND_README.md       # This file
```

## API Documentation

### Authentication

The API uses JWT (JSON Web Tokens) for authentication.

#### Get Access Token

```bash
POST /api/token/
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

#### Use Token in Requests

```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbG...
```

#### Refresh Token

```bash
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

### REST Framework Browsable API

Visit http://localhost:8000/api/ to explore the API interactively.

## Stripe Integration

### Test Mode

The backend is configured to work with Stripe test mode by default.

1. Get test keys from https://dashboard.stripe.com/test/apikeys
2. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Webhook Setup

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# Or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/webhooks/stripe/

# Copy the webhook signing secret to .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up production database (PostgreSQL)
- [ ] Configure production Redis
- [ ] Set up Stripe live keys
- [ ] Configure email backend (SMTP)
- [ ] Set up static file serving (WhiteNoise is already configured)
- [ ] Configure HTTPS/SSL
- [ ] Set up Celery workers with supervisord/systemd
- [ ] Enable database backups
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure logging

### Running with Gunicorn

```bash
gunicorn seed_spoon.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Collect Static Files

```bash
python manage.py collectstatic --no-input
```

## Troubleshooting

### PostgreSQL Connection Issues

**Error:** `connection to server at "localhost" (127.0.0.1), port 5432 failed`

**Solutions:**
1. Ensure PostgreSQL is running: `brew services start postgresql@15` (macOS) or `sudo systemctl start postgresql` (Linux)
2. Check connection settings in `.env`
3. Verify database exists: `psql -U postgres -l`

### Redis Connection Issues

**Error:** `Error connecting to Redis`

**Solutions:**
1. Ensure Redis is running: `brew services start redis` (macOS) or `sudo systemctl start redis` (Linux)
2. Check `REDIS_URL` in `.env`
3. Test connection: `redis-cli ping`

### Migration Issues

**Error:** `No migrations to apply`

**Solution:**
```bash
python manage.py makemigrations
python manage.py migrate
```

### PostGIS Installation

**Error:** `Could not find the GDAL library`

**Solutions:**
- Install system libraries (see PostGIS Setup section above)
- Or comment out `django.contrib.gis` in `INSTALLED_APPS` if not using geospatial features

## Environment-Specific Settings

### Development

`.env` should have:
```env
DEBUG=True
LOG_LEVEL=DEBUG
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Production

`.env` should have:
```env
DEBUG=False
LOG_LEVEL=WARNING
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
SECURE_SSL_REDIRECT=True
```

## Next Steps

1. **Create your first model** in `core/models.py`
2. **Create serializers** in `core/serializers.py`
3. **Create API views** in `core/views.py`
4. **Add URL routes** in `core/urls.py`
5. **Write tests** in `core/tests.py`

Example model:
```python
from django.db import models

class FoodResource(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    # For geospatial:
    # from django.contrib.gis.db import models
    # location = models.PointField()

    def __str__(self):
        return self.name
```

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [PostGIS Documentation](https://postgis.net/documentation/)

## Support

For issues or questions:
- Check this README
- Review Django/DRF documentation
- Check `logs/django.log` for error details

---

**Happy coding! 🚀**
