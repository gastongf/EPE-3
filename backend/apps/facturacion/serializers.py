from rest_framework import serializers
from .models import Factura


class FacturaSerializer(serializers.ModelSerializer):
    fecha_emision = serializers.DateField(source='fecha', read_only=True)
    tutor_nombre = serializers.CharField(source='tutor.nombre', read_only=True, default='')
    mascota_nombre = serializers.CharField(source='mascota.nombre', read_only=True)
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)

    class Meta:
        model = Factura
        fields = '__all__'
