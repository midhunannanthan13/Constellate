from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabitViewSet, MySkyView

router = DefaultRouter()
router.register(r'habits', HabitViewSet, basename='habit')
router.register(r'sky', MySkyView, basename='sky')

urlpatterns = [
    path('', include(router.urls)),
]
