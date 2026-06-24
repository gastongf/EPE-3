from rest_framework.routers import DefaultRouter
from .views import FichaMedicaViewSet

router = DefaultRouter()
router.register(r'', FichaMedicaViewSet)
urlpatterns = router.urls
