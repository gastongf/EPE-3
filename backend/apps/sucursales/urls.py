from rest_framework.routers import DefaultRouter
from .views import SucursalViewSet

router = DefaultRouter()
router.register(r'', SucursalViewSet)
urlpatterns = router.urls
