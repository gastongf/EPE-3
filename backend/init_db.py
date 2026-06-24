import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.sucursales.models import Sucursal
from apps.doctores.models import Doctor
from apps.tutores.models import Tutor
from apps.pacientes.models import Paciente

User = get_user_model()

def run():
    # Sucursales
    suc1, _ = Sucursal.objects.get_or_create(
        nombre='Veterinaria Los Andes Principal',
        defaults={
            'rut': '76.123.456-7',
            'direccion': 'Av. Providencia 1234',
            'region': 'Metropolitana',
            'comuna': 'Providencia',
            'telefono': '+562 2345 6789',
            'email': 'contacto@vetandes.cl',
            'activa': True,
        }
    )
    suc2, _ = Sucursal.objects.get_or_create(
        nombre='Veterinaria Los Andes Vitacura',
        defaults={
            'rut': '76.987.654-3',
            'direccion': 'Av. Vitacura 5678',
            'region': 'Metropolitana',
            'comuna': 'Vitacura',
            'telefono': '+562 2987 6543',
            'email': 'vitacura@vetandes.cl',
            'activa': True,
        }
    )
    print(f'Sucursales creadas: {suc1.nombre}, {suc2.nombre}')

    # Usuarios
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@vetandes.cl',
            'first_name': 'Admin',
            'last_name': 'Sistema',
            'rol': 'admin',
            'sucursal': suc1,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    admin_user.set_password('admin123')
    admin_user.save()

    doc1_user, _ = User.objects.get_or_create(
        username='dr.perez',
        defaults={
            'email': 'dr.perez@vetandes.cl',
            'first_name': 'Carlos',
            'last_name': 'Pérez',
            'rol': 'doctor',
            'sucursal': suc1,
        }
    )
    doc1_user.set_password('doc123')
    doc1_user.save()

    doc2_user, _ = User.objects.get_or_create(
        username='dra.lopez',
        defaults={
            'email': 'dra.lopez@vetandes.cl',
            'first_name': 'María',
            'last_name': 'López',
            'rol': 'doctor',
            'sucursal': suc2,
        }
    )
    doc2_user.set_password('doc123')
    doc2_user.save()

    superadmin_user, _ = User.objects.get_or_create(
        username='superadmin',
        defaults={
            'email': 'superadmin@vetandes.cl',
            'first_name': 'Super',
            'last_name': 'Admin',
            'rol': 'superadmin',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    superadmin_user.set_password('super123')
    superadmin_user.save()

    asistente_user, _ = User.objects.get_or_create(
        username='asistente',
        defaults={
            'email': 'asistente@vetandes.cl',
            'first_name': 'Asistente',
            'last_name': 'Sucursal',
            'rol': 'asistente',
            'sucursal': suc1,
        }
    )
    asistente_user.set_password('asist123')
    asistente_user.save()
    print(f'Usuarios creados: {superadmin_user.username}, {admin_user.username}, {doc1_user.username}, {doc2_user.username}, {asistente_user.username}')

    # Doctores
    doc1, _ = Doctor.objects.get_or_create(
        user=doc1_user,
        defaults={
            'sucursal': suc1,
            'nombre': 'Dr. Carlos Pérez',
            'rut': '12.345.678-9',
            'especialidad': 'Medicina General',
            'numero_registro': 'REG-001',
            'horarios': {
                'lunes': '09:00-18:00',
                'martes': '09:00-18:00',
                'miercoles': '09:00-18:00',
                'jueves': '09:00-18:00',
                'viernes': '09:00-14:00',
            },
            'activo': True,
        }
    )
    doc2, _ = Doctor.objects.get_or_create(
        user=doc2_user,
        defaults={
            'sucursal': suc2,
            'nombre': 'Dra. María López',
            'rut': '23.456.789-0',
            'especialidad': 'Cirugía Veterinaria',
            'numero_registro': 'REG-002',
            'horarios': {
                'lunes': '10:00-19:00',
                'martes': '10:00-19:00',
                'miercoles': '10:00-19:00',
                'jueves': '10:00-19:00',
                'viernes': '10:00-15:00',
            },
            'activo': True,
        }
    )
    print(f'Doctores creados: {doc1.nombre}, {doc2.nombre}')

    # Tutores
    tut1, _ = Tutor.objects.get_or_create(
        rut='11.111.111-1',
        defaults={
            'nombre': 'Juan González',
            'email': 'juan.gonzalez@email.com',
            'telefono': '+569 1234 5678',
            'direccion': 'Av. Siempre Viva 742, Providencia',
        }
    )
    tut2, _ = Tutor.objects.get_or_create(
        rut='22.222.222-2',
        defaults={
            'nombre': 'Ana Silva',
            'email': 'ana.silva@email.com',
            'telefono': '+569 8765 4321',
            'direccion': 'Calle Los Olivos 345, Vitacura',
        }
    )
    print(f'Tutores creados: {tut1.nombre}, {tut2.nombre}')

    # Mascotas
    pac1, _ = Paciente.objects.get_or_create(
        nombre='Firulais',
        defaults={
            'especie': 'Perro',
            'raza': 'Labrador Retriever',
            'sexo': 'macho',
            'fecha_nacimiento': '2020-03-15',
            'color': 'Dorado',
            'microchip': 'CHIP-001',
            'tutor': tut1,
            'sucursal_registro': suc1,
        }
    )
    pac2, _ = Paciente.objects.get_or_create(
        nombre='Mishi',
        defaults={
            'especie': 'Gato',
            'raza': 'Siamés',
            'sexo': 'hembra',
            'fecha_nacimiento': '2021-07-20',
            'color': 'Crema',
            'microchip': 'CHIP-002',
            'tutor': tut1,
            'sucursal_registro': suc1,
        }
    )
    pac3, _ = Paciente.objects.get_or_create(
        nombre='Rocky',
        defaults={
            'especie': 'Perro',
            'raza': 'Pastor Alemán',
            'sexo': 'macho',
            'fecha_nacimiento': '2019-11-01',
            'color': 'Negro y Café',
            'microchip': 'CHIP-003',
            'tutor': tut2,
            'sucursal_registro': suc2,
        }
    )
    print(f'Mascotas creadas: {pac1.nombre}, {pac2.nombre}, {pac3.nombre}')
    print('Base de datos inicializada correctamente.')

if __name__ == '__main__':
    run()
