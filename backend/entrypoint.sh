#!/bin/bash
set -e

echo "⏳ Esperando a PostgreSQL..."
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL está listo"

echo "🔧 Generando archivos de migración..."
python manage.py makemigrations users sucursales doctores tutores pacientes fichas_medicas citas facturacion notificaciones --noinput

echo "🚀 Ejecutando migraciones..."
python manage.py migrate --noinput

echo "🌱 Sembrando datos de prueba..."
python init_db.py

echo "🎯 Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000
