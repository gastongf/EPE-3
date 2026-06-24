import uuid
from django.db import models


class Cita(models.Model):
    class Estado(models.TextChoices):
        AGENDADA = 'agendada', 'Agendada'
        CONFIRMADA = 'confirmada', 'Confirmada'
        EN_ATENCION = 'en_atencion', 'En Atención'
        CANCELADA = 'cancelada', 'Cancelada'
        REALIZADA = 'realizada', 'Realizada'

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
    fecha_hora = models.DateTimeField(verbose_name='Fecha y Hora')
    motivo = models.TextField(verbose_name='Motivo')
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.AGENDADA,
        verbose_name='Estado',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creada')

    class Meta:
        verbose_name = 'Cita'
        verbose_name_plural = 'Citas'

    def __str__(self):
        return f'{self.mascota.nombre} - {self.fecha_hora.strftime("%d/%m/%Y %H:%M")}'
