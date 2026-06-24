from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, UserWriteSerializer, LoginSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return UserWriteSerializer
        return UserSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'superadmin':
            return qs
        if user.sucursal:
            qs = qs.filter(sucursal=user.sucursal)
        return qs

    def perform_create(self, serializer):
        if self.request.user.rol not in ('superadmin', 'admin'):
            raise PermissionDenied('No tienes permiso para crear usuarios')
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.rol not in ('superadmin', 'admin'):
            raise PermissionDenied('No tienes permiso para editar usuarios')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.rol != 'superadmin':
            raise PermissionDenied('Solo superadmin puede eliminar usuarios')
        instance.delete()


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if not user:
        return Response(
            {'error': 'Credenciales inválidas'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)