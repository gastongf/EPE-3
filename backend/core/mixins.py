from django.db import models


class TenantMixin(models.Model):
    sucursal = models.ForeignKey(
        'sucursales.Sucursal',
        on_delete=models.CASCADE,
        verbose_name='Sucursal',
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        request_tenant = getattr(self, '_request_tenant', None)
        if request_tenant and not self.sucursal_id:
            self.sucursal = request_tenant
        super().save(*args, **kwargs)


class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id and request.user.is_authenticated:
            from apps.sucursales.models import Sucursal
            try:
                request.tenant = Sucursal.objects.get(id=tenant_id)
            except Sucursal.DoesNotExist:
                request.tenant = None
        elif request.user.is_authenticated:
            request.tenant = getattr(request.user, 'sucursal', None)
        else:
            request.tenant = None
        return self.get_response(request)
