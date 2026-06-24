import uuid
from django.db import models


class Doctor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name='Usuario',
    )
    sucursal = models.ForeignKey(
        'sucursales.Sucursal',
        on_delete=models.CASCADE,
        verbose_name='Sucursal',
    )
    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    rut = models.CharField(max_length=20, verbose_name='RUT')
    especialidad = models.CharField(max_length=100, verbose_name='Especialidad')
    numero_registro = models.CharField(max_length=50, verbose_name='N° Registro')
    horarios = models.JSONField(default=dict, blank=True, verbose_name='Horarios')
    activo = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Doctor'
        verbose_name_plural = 'Doctores'

    def __str__(self):
        return f'{self.nombre} - {self.especialidad}'
