from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabitViewSet, MySkyView, WeeklyReportView

router = DefaultRouter()
router.register(r'habits', HabitViewSet, basename='habit')
router.register(r'sky', MySkyView, basename='sky')
router.register(r'reports/weekly', WeeklyReportView, basename='weekly-report')

urlpatterns = [
    path('', include(router.urls)),
]
