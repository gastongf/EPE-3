from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from .models import Sucursal
from .serializers import SucursalSerializer


class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'superadmin':
            return qs
        if user.sucursal:
            qs = qs.filter(id=user.sucursal_id)
        return qs

    def perform_create(self, serializer):
        if self.request.user.rol != 'superadmin':
            raise PermissionDenied('Solo superadmin puede crear sucursales')
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.rol != 'superadmin':
            raise PermissionDenied('Solo superadmin puede editar sucursales')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.rol != 'superadmin':
            raise PermissionDenied('Solo superadmin puede eliminar sucursales')
        instance.delete()