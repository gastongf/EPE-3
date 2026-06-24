from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from .models import Factura
from .serializers import FacturaSerializer


class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'superadmin':
            return qs
        if user.rol == 'admin' and user.sucursal:
            qs = qs.filter(sucursal=user.sucursal)
        else:
            qs = qs.none()
        return qs

    def perform_create(self, serializer):
        if self.request.user.rol not in ('superadmin', 'admin'):
            raise PermissionDenied('No tienes permiso para crear facturas')
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.rol not in ('superadmin', 'admin'):
            raise PermissionDenied('No tienes permiso para editar facturas')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.rol not in ('superadmin', 'admin'):
            raise PermissionDenied('No tienes permiso para eliminar facturas')
        instance.delete()