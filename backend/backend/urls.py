# ESTE ES EL ARCHIVO PRINCIPAL: backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Esta línea conecta el archivo principal con el que acabas de crear
    path('api/', include('api.urls')), 
    
    path('api-token-auth/', views.obtain_auth_token),
]