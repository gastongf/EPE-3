import uuid
from django.db import models


class Notificacion(models.Model):
    class Tipo(models.TextChoices):
        EMAIL = 'email', 'Email'
        WHATSAPP = 'whatsapp', 'WhatsApp'
        LLAMADA = 'llamada', 'Llamada'

    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        ENVIADA = 'enviada', 'Enviada'
        FALLIDA = 'fallida', 'Fallida'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mascota = models.ForeignKey(
        'pacientes.Paciente',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name='Mascota',
    )
    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices,
        verbose_name='Tipo',
    )
    destinatario = models.CharField(max_length=200, verbose_name='Destinatario')
    mensaje = models.TextField(verbose_name='Mensaje')
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
        verbose_name='Estado',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creada')

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'

    def __str__(self):
        return f'{self.get_tipo_display()} a {self.destinatario} - {self.get_estado_display()}'
