import uuid
from django.db import models
from django.utils.crypto import get_random_string


def generar_codigo_acceso():
    return get_random_string(8).upper()


class FichaMedica(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mascota = models.ForeignKey(
        'pacientes.Paciente',
        on_delete=models.CASCADE,
        verbose_name='Mascota',
    )
    doctor = models.ForeignKey(
        'doctores.Doctor',
        on_delete=models.CASCADE,
        verbose_name='Doctor',
    )
    sucursal = models.ForeignKey(
        'sucursales.Sucursal',
        on_delete=models.CASCADE,
        verbose_name='Sucursal',
    )
    fecha = models.DateField(auto_now_add=True, verbose_name='Fecha')
    peso = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True, default=None, verbose_name='Peso (kg)')
    temperatura = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True, default=None, verbose_name='Temperatura (°C)')
    diagnostico = models.TextField(verbose_name='Diagnóstico')
    tratamiento = models.TextField(verbose_name='Tratamiento')
    medicamentos = models.TextField(blank=True, default='', verbose_name='Medicamentos')
    examenes = models.TextField(blank=True, default='', verbose_name='Exámenes')
    codigo_acceso = models.CharField(
        max_length=8, unique=True, default=generar_codigo_acceso,
        editable=False, verbose_name='Código de Acceso',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creada')

    class Meta:
        verbose_name = 'Ficha Médica'
        verbose_name_plural = 'Fichas Médicas'

    def __str__(self):
        return f'Ficha {self.mascota.nombre} - {self.fecha}'
