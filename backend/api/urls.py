from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'productos', views.ProductoViewSet)
router.register(r'ventas', views.VentaViewSet)
router.register(r'gastos', views.GastoViewSet) # <--- NUEVO ENDPOINT

urlpatterns = [
    path('', include(router.urls)),
    path('registrar-venta/', views.registrar_venta, name='registrar_venta'),
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
]