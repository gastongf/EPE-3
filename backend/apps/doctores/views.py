from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from .models import Doctor
from .serializers import DoctorSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'superadmin':
            return qs
        if user.rol in ('admin', 'doctor', 'asistente') and user.sucursal:
            qs = qs.filter(sucursal=user.sucursal)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol in ('superadmin', 'admin'):
            if user.rol == 'admin':
                serializer.save(sucursal=user.sucursal)
            else:
                serializer.save()