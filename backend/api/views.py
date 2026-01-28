from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

# Modelos
from .models import Producto, Venta, DetalleVenta, Gasto
from .serializers import ProductoSerializer, VentaSerializer, GastoSerializer

# --- VIEWSETS ---
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all().order_by('-fecha')
    serializer_class = VentaSerializer

class GastoViewSet(viewsets.ModelViewSet): # <--- NUEVO
    queryset = Gasto.objects.all().order_by('-fecha')
    serializer_class = GastoSerializer

# --- REGISTRAR VENTA ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def registrar_venta(request):
    carrito = request.data.get('items', [])
    if not carrito: return Response({'error': 'Carrito vacío'}, status=400)

    try:
        with transaction.atomic():
            nueva_venta = Venta.objects.create(usuario=request.user, total=0)
            total_calculado = 0
            
            for item in carrito:
                producto = Producto.objects.select_for_update().get(id=item['id'])
                cantidad = int(item['cantidad'])
                
                if producto.stock < cantidad:
                    raise Exception(f"Sin stock: {producto.nombre}")
                
                producto.stock -= cantidad
                producto.save()
                
                subtotal = producto.precio * cantidad
                total_calculado += subtotal

                DetalleVenta.objects.create(venta=nueva_venta, producto=producto, cantidad=cantidad, subtotal=subtotal)
            
            nueva_venta.total = total_calculado
            nueva_venta.save()

        return Response({'mensaje': 'Venta OK'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# --- DASHBOARD (AHORA CON GASTOS) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    # Lógica manual de fechas (La que arreglamos antes)
    ahora_utc = timezone.now()
    ahora_arg = ahora_utc - timedelta(hours=3)
    hoy_texto = ahora_arg.strftime('%Y-%m-%d')
    
    datos_grafico = []
    labels_grafico = []
    ventas_hoy = 0
    cantidad_perfumes_hoy = 0
    gastos_hoy = 0 # <--- NUEVO
    
    todas_las_ventas = Venta.objects.all()
    todos_los_gastos = Gasto.objects.all() # <--- Traemos gastos

    # Recorremos 7 días
    for i in range(6, -1, -1):
        fecha_bucle = ahora_arg - timedelta(days=i)
        texto_bucle = fecha_bucle.strftime('%Y-%m-%d')
        
        suma_dia = 0
        perfumes_dia = 0
        
        # 1. Sumar Ventas
        for venta in todas_las_ventas:
            fecha_venta_arg = venta.fecha - timedelta(hours=3)
            if fecha_venta_arg.strftime('%Y-%m-%d') == texto_bucle:
                suma_dia += float(venta.total)
                if i == 0:
                    detalles = DetalleVenta.objects.filter(venta=venta)
                    for d in detalles: perfumes_dia += d.cantidad

        # 2. Sumar Gastos (Solo nos importa el total de HOY para el KPI)
        if i == 0:
            for gasto in todos_los_gastos:
                fecha_gasto_arg = gasto.fecha - timedelta(hours=3)
                if fecha_gasto_arg.strftime('%Y-%m-%d') == hoy_texto:
                    gastos_hoy += float(gasto.monto)

        datos_grafico.append(suma_dia)
        labels_grafico.append(fecha_bucle.strftime("%d/%m"))
        
        if i == 0:
            ventas_hoy = suma_dia
            cantidad_perfumes_hoy = perfumes_dia

    stock_bajo = Producto.objects.filter(stock__lt=5).count()
    
    # Calculamos Ganancia Neta
    ganancia_neta = ventas_hoy - gastos_hoy

    return Response({
        'grafico': datos_grafico,
        'labels': labels_grafico,
        'ventas_hoy': ventas_hoy,
        'cantidad_perfumes': cantidad_perfumes_hoy,
        'stock_bajo': stock_bajo,
        'gastos_hoy': gastos_hoy,      # <--- Enviamos al front
        'ganancia_neta': ganancia_neta # <--- Enviamos al front
    })