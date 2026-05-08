@echo off
echo Installing dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py makemigrations museum
python manage.py migrate

echo Loading initial data...
python manage.py loaddata museum/fixtures/initial_data.json

echo Creating superuser (admin / admin123)...
python manage.py shell -c "from museum.models import CustomUser; CustomUser.objects.filter(username='admin').exists() or CustomUser.objects.create_superuser('admin', 'admin@gem.eg', 'admin123')"

echo Done! Run: python manage.py runserver
pause
