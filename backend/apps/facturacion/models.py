import uuid
from django.db import models


class Factura(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        PAGADA = 'pagada', 'Pagada'
        ANULADA = 'anulada', 'Anulada'

    class MetodoPago(models.TextChoices):
        EFECTIVO = 'efectivo', 'Efectivo'
        TARJETA_CREDITO = 'tarjeta_credito', 'Tarjeta crédito'
        TARJETA_DEBITO = 'tarjeta_debito', 'Tarjeta débito'
        TRANSFERENCIA = 'transferencia', 'Transferencia'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cita = models.ForeignKey(
        'citas.Cita',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name='Cita',
    )
    tutor = models.ForeignKey(
        'tutores.Tutor',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name='Tutor',
    )
    mascota = models.ForeignKey(
        'pacientes.Paciente',
        on_delete=models.CASCADE,
        verbose_name='Mascota',
    )
    sucursal = models.ForeignKey(
        'sucursales.Sucursal',
        on_delete=models.CASCADE,
        verbose_name='Sucursal',
    )
    fecha = models.DateField(auto_now_add=True, verbose_name='Fecha Emisión')
    servicios = models.JSONField(default=list, verbose_name='Servicios')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Subtotal')
    iva = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='IVA')
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Total')
    metodo_pago = models.CharField(
        max_length=20,
        choices=MetodoPago.choices,
        default=MetodoPago.EFECTIVO,
        verbose_name='Método de Pago',
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
        verbose_name='Estado',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creada')

    class Meta:
        verbose_name = 'Factura'
        verbose_name_plural = 'Facturas'

    def __str__(self):
        return f'Factura #{self.id.hex[:8].upper()} - ${self.total}'
