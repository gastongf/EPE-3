from rest_framework import serializers
from apps.tutores.models import Tutor
from .models import Paciente


class PacienteSerializer(serializers.ModelSerializer):
    tutor_nombre = serializers.CharField(source='tutor.nombre', read_only=True)
    tutor_rut = serializers.CharField(source='tutor.rut', read_only=True)
    tutor_telefono = serializers.CharField(source='tutor.telefono', read_only=True)
    tutor_email = serializers.EmailField(source='tutor.email', read_only=True)
    tutor_direccion = serializers.CharField(source='tutor.direccion', read_only=True)
    sucursal_registro = serializers.CharField(read_only=True)
    tutor_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = Paciente
        fields = '__all__'
        extra_kwargs = {
            'tutor': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        tutor_data = validated_data.pop('tutor_data', None)
        if tutor_data:
            rut = tutor_data.get('rut', '').strip()
            if rut:
                tutor, _ = Tutor.objects.get_or_create(
                    rut=rut,
                    defaults={
                        'nombre': tutor_data.get('nombre', ''),
                        'telefono': tutor_data.get('telefono', ''),
                        'email': tutor_data.get('email', ''),
                        'direccion': tutor_data.get('direccion', ''),
                    }
                )
                validated_data['tutor'] = tutor
            else:
                raise serializers.ValidationError({'tutor_data': 'RUT del tutor es requerido'})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        tutor_data = validated_data.pop('tutor_data', None)
        if tutor_data:
            tutor = instance.tutor
            for field in ('nombre', 'rut', 'telefono', 'email', 'direccion'):
                val = tutor_data.get(field)
                if val is not None:
                    setattr(tutor, field, val)
            tutor.save()
        return super().update(instance, validated_data)
