import uuid
from django.db import models


class Sucursal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    rut = models.CharField(max_length=20, verbose_name='RUT')
    logo = models.URLField(blank=True, default='', verbose_name='Logo URL')
    direccion = models.TextField(verbose_name='Dirección')
    region = models.CharField(max_length=100, verbose_name='Región')
    comuna = models.CharField(max_length=100, verbose_name='Comuna')
    telefono = models.CharField(max_length=20, verbose_name='Teléfono')
    email = models.EmailField(verbose_name='Email')
    activa = models.BooleanField(default=True, verbose_name='Activa')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creada')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Actualizada')

    class Meta:
        verbose_name = 'Sucursal'
        verbose_name_plural = 'Sucursales'

    def __str__(self):
        return self.nombre
