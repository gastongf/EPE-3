from datetime import datetime
from django.utils import timezone
from rest_framework import serializers
from .models import Cita


class CitaSerializer(serializers.ModelSerializer):
    fecha = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()
    mascota_nombre = serializers.CharField(source='mascota.nombre', read_only=True)
    doctor_nombre = serializers.CharField(source='doctor.nombre', read_only=True)
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)

    class Meta:
        model = Cita
        fields = '__all__'
        extra_kwargs = {
            'sucursal': {'required': False, 'allow_null': True},
        }

    def _local(self, obj):
        if obj.fecha_hora and timezone.is_aware(obj.fecha_hora):
            return timezone.localtime(obj.fecha_hora)
        return obj.fecha_hora

    def get_fecha(self, obj):
        dt = self._local(obj)
        return dt.strftime('%Y-%m-%d') if dt else ''

    def get_hora(self, obj):
        dt = self._local(obj)
        return dt.strftime('%H:%M') if dt else ''

    def to_internal_value(self, data):
        if isinstance(data, dict):
            fecha = data.pop('fecha', None)
            hora = data.pop('hora', None)
            if fecha and hora:
                data['fecha_hora'] = f'{fecha} {hora}'
        return super().to_internal_value(data)