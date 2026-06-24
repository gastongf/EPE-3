from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Doctor

User = get_user_model()


class DoctorSerializer(serializers.ModelSerializer):
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)
    username = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)
    sucursal = serializers.PrimaryKeyRelatedField(
        queryset=User.sucursal.field.remote_field.model.objects.all(),
        required=False, allow_null=True,
    )
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Doctor
        fields = '__all__'

    def create(self, validated_data):
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        if username and password:
            user = User.objects.create_user(
                username=username,
                email=email or '',
                password=password,
                rol='doctor',
                sucursal=validated_data.get('sucursal'),
            )
            validated_data['user'] = user
        return super().create(validated_data)