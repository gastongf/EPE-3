from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from .models import Cita
from .serializers import CitaSerializer


class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'superadmin':
            pass
        elif user.sucursal:
            qs = qs.filter(sucursal=user.sucursal)
        fecha = self.request.query_params.get('fecha')
        doctor = self.request.query_params.get('doctor')
        estado = self.request.query_params.get('estado')
        if fecha:
            qs = qs.filter(fecha_hora__date=fecha)
        if doctor:
            qs = qs.filter(doctor_id=doctor)
        if estado:
            qs = qs.filter(estado=estado)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol == 'asistente':
            raise PermissionDenied('Asistente no puede crear citas')
        if user.sucursal:
            serializer.save(sucursal=user.sucursal)
        else:
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if user.rol == 'asistente':
            raise PermissionDenied('Asistente no puede editar citas')
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.rol not in ('superadmin', 'admin'):
            raise PermissionDenied('No tienes permiso para eliminar citas')
        instance.delete()