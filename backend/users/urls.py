from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'usuarios', views.UserViewSet)

urlpatterns = [
    path('login/', views.login_view, name='auth-login'),
    path('me/', views.me_view, name='auth-me'),
    path('', include(router.urls)),
]
