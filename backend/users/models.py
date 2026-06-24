from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Rol(models.TextChoices):
        SUPERADMIN = 'superadmin', 'Superadmin'
        ADMIN = 'admin', 'Admin'
        DOCTOR = 'doctor', 'Doctor'
        ASISTENTE = 'asistente', 'Asistente'

    rol = models.CharField(
        max_length=20,
        choices=Rol.choices,
        default=Rol.ASISTENTE,
        verbose_name='Rol',
    )
    sucursal = models.ForeignKey(
        'sucursales.Sucursal',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name='Sucursal',
    )
    telefono = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name='Teléfono',
    )

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.get_full_name()} ({self.get_rol_display()})'
