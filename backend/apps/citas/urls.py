from rest_framework.routers import DefaultRouter
from .views import CitaViewSet

router = DefaultRouter()
router.register(r'', CitaViewSet)
urlpatterns = router.urls
