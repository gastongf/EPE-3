from rest_framework.routers import DefaultRouter
from .views import FacturaViewSet

router = DefaultRouter()
router.register(r'', FacturaViewSet)
urlpatterns = router.urls
