#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Instalar librerías
pip install -r requirements.txt

# 2. Recolectar archivos estáticos
python manage.py collectstatic --no-input

# 3. Crear las tablas de la base de datos (IMPORTANTE)
python manage.py migrate

# 4. Crear el usuario automáticamente (usando las variables que acabas de guardar)
# El "|| true" es para que no falle si el usuario ya existe.
python manage.py createsuperuser --noinput || true