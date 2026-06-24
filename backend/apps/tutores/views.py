from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Tutor
from .serializers import TutorSerializer


class TutorViewSet(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()
    serializer_class = TutorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'superadmin':
            pass
        elif user.sucursal:
            qs = qs.filter(
                Q(paciente__sucursal_registro=user.sucursal) |
                Q(paciente__tiene_acceso_cruzado=True)
            ).distinct()
        rut = self.request.query_params.get('rut')
        if rut:
            qs = qs.filter(rut__icontains=rut)
        return qs

    def perform_create(self, serializer):
        if self.request.user.rol == 'asistente':
            raise PermissionDenied('Asistente no puede crear tutores')
        serializer.save()