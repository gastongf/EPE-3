from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import FichaMedica
from .serializers import FichaMedicaSerializer


class FichaMedicaViewSet(viewsets.ModelViewSet):
    queryset = FichaMedica.objects.all()
    serializer_class = FichaMedicaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'superadmin':
            return qs
        if user.sucursal:
            qs = qs.filter(
                Q(mascota__sucursal_registro=user.sucursal) |
                Q(mascota__tiene_acceso_cruzado=True)
            )
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol not in ('superadmin', 'admin', 'doctor'):
            raise PermissionDenied('Solo doctores y admins pueden crear fichas')
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if user.rol not in ('superadmin', 'admin', 'doctor'):
            raise PermissionDenied('No tienes permiso para editar fichas')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.rol != 'superadmin':
            raise PermissionDenied('Solo superadmin puede eliminar fichas')
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path=r'acceso/(?P<codigo>[^/.]+)')
    def acceso_por_codigo(self, request, codigo=None):
        try:
            ficha = FichaMedica.objects.get(codigo_acceso=codigo.upper())
            serializer = self.get_serializer(ficha)
            return Response(serializer.data)
        except FichaMedica.DoesNotExist:
            return Response(
                {'error': 'Código de acceso inválido'},
                status=status.HTTP_404_NOT_FOUND,
            )