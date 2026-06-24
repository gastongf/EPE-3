import uuid
from django.db import models


class Paciente(models.Model):
    class Sexo(models.TextChoices):
        MACHO = 'macho', 'Macho'
        HEMBRA = 'hembra', 'Hembra'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    especie = models.CharField(max_length=50, verbose_name='Especie')
    raza = models.CharField(max_length=100, verbose_name='Raza')
    sexo = models.CharField(max_length=10, choices=Sexo.choices, verbose_name='Sexo')
    fecha_nacimiento = models.DateField(verbose_name='Fecha de Nacimiento')
    color = models.CharField(max_length=100, verbose_name='Color')
    microchip = models.CharField(
        max_length=50, unique=True, null=True, blank=True,
        verbose_name='Microchip',
    )
    tutor = models.ForeignKey(
        'tutores.Tutor',
        on_delete=models.CASCADE,
        verbose_name='Tutor',
    )
    sucursal_registro = models.ForeignKey(
        'sucursales.Sucursal',
        on_delete=models.CASCADE,
        verbose_name='Sucursal de Registro',
    )
    tiene_acceso_cruzado = models.BooleanField(
        default=False,
        verbose_name='Acceso multi-sucursal autorizado',
        help_text='Autorización del tutor para que el paciente sea visible en todas las sucursales',
    )
    codigo_acceso = models.CharField(
        max_length=6, null=True, blank=True,
        verbose_name='Código de autorización',
    )
    codigo_expiracion = models.DateTimeField(
        null=True, blank=True,
        verbose_name='Expiración del código',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado')

    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'

    def __str__(self):
        return f'{self.nombre} ({self.especie})'
