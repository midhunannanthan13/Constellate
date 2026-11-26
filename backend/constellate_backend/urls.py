from django.contrib import admin
from django.urls import path
from django.http import JsonResponse

def api_health_check(request):
    return JsonResponse({
        "status": "healthy",
        "app": "Constellate API",
        "version": "1.0.0",
        "message": "Your habits, written in stars."
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health_check, name='api-health'),
]
