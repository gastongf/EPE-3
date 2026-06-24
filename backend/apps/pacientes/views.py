import random
from datetime import timedelta
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Paciente
from .serializers import PacienteSerializer


class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol == 'asistente':
            raise PermissionDenied('Asistente no puede crear pacientes')
        serializer.save(sucursal_registro=user.sucursal)

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'superadmin':
            return qs
        if user.sucursal:
            qs = qs.filter(
                Q(sucursal_registro=user.sucursal) |
                Q(tiene_acceso_cruzado=True)
            )
        return qs

    @action(detail=False, methods=['get'], url_path='buscar-microchip')
    def buscar_microchip(self, request):
        chip = request.query_params.get('chip')
        if not chip:
            return Response(
                {'error': 'Debe proporcionar un código de microchip'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        pacientes = Paciente.objects.filter(microchip=chip)
        serializer = self.get_serializer(pacientes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='enviar-codigo')
    def enviar_codigo(self, request, pk=None):
        paciente = self.get_object()
        if not paciente.tutor.email:
            return Response(
                {'error': 'El tutor no tiene correo electrónico registrado'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        codigo = f'{random.randint(0, 999999):06d}'
        paciente.codigo_acceso = codigo
        paciente.codigo_expiracion = timezone.now() + timedelta(minutes=30)
        paciente.save(update_fields=['codigo_acceso', 'codigo_expiracion'])
        send_mail(
            subject='Código de autorización multi-sucursal',
            message=(
                f'Hola {paciente.tutor.nombre},\n\n'
                f'Se ha solicitado autorización para que {paciente.nombre} '
                f'sea visible en todas las sucursales.\n\n'
                f'Tu código de autorización es: {codigo}\n\n'
                f'Este código expira en 30 minutos.\n'
                f'Si no solicitaste esto, ignora este mensaje.'
            ),
            from_email=None,
            recipient_list=[paciente.tutor.email],
            fail_silently=False,
        )
        return Response({'mensaje': 'Código enviado al correo del tutor'})

    @action(detail=True, methods=['post'], url_path='verificar-codigo')
    def verificar_codigo(self, request, pk=None):
        paciente = self.get_object()
        codigo = request.data.get('codigo', '').strip()
        if not codigo:
            return Response(
                {'error': 'Debe proporcionar el código de autorización'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if paciente.codigo_acceso != codigo:
            return Response(
                {'error': 'Código incorrecto'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not paciente.codigo_expiracion or timezone.now() > paciente.codigo_expiracion:
            return Response(
                {'error': 'El código ha expirado. Solicite uno nuevo'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        paciente.tiene_acceso_cruzado = True
        paciente.codigo_acceso = None
        paciente.codigo_expiracion = None
        paciente.save(update_fields=['tiene_acceso_cruzado', 'codigo_acceso', 'codigo_expiracion'])
        serializer = self.get_serializer(paciente)
        return Response(serializer.data)