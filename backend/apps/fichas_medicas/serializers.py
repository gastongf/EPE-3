from rest_framework import serializers
from .models import FichaMedica


class FichaMedicaSerializer(serializers.ModelSerializer):
    mascota_nombre = serializers.CharField(source='mascota.nombre', read_only=True)
    doctor_nombre = serializers.CharField(source='doctor.nombre', read_only=True)
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)

    class Meta:
        model = FichaMedica
        fields = '__all__'
        read_only_fields = ['codigo_acceso']
