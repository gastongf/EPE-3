from rest_framework.routers import DefaultRouter
from .views import NotificacionViewSet

router = DefaultRouter()
router.register(r'', NotificacionViewSet)
urlpatterns = router.urls
