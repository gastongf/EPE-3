from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/sucursales/', include('apps.sucursales.urls')),
    path('api/doctores/', include('apps.doctores.urls')),
    path('api/tutores/', include('apps.tutores.urls')),
    path('api/pacientes/', include('apps.pacientes.urls')),
    path('api/fichas-medicas/', include('apps.fichas_medicas.urls')),
    path('api/citas/', include('apps.citas.urls')),
    path('api/facturas/', include('apps.facturacion.urls')),
    path('api/notificaciones/', include('apps.notificaciones.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
