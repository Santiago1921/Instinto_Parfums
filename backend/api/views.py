from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from django.utils.dateparse import parse_date # <--- IMPORTANTE: Nuevo import
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

class GastoViewSet(viewsets.ModelViewSet):
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
                
                # Precio variable o precio original
                precio_venta = float(item.get('precio', producto.precio))
                
                if producto.stock < cantidad:
                    raise Exception(f"Sin stock: {producto.nombre}")
                
                producto.stock -= cantidad
                producto.save()
                
                subtotal = precio_venta * cantidad
                total_calculado += subtotal

                DetalleVenta.objects.create(venta=nueva_venta, producto=producto, cantidad=cantidad, subtotal=subtotal)
            
            nueva_venta.total = total_calculado
            nueva_venta.save()

        return Response({'mensaje': 'Venta OK'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# --- DASHBOARD CON FILTROS DE FECHA ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    # 1. Obtener fechas del Frontend (o usar valores por defecto: últimos 7 días)
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')
    
    ahora_utc = timezone.now()
    ahora_arg = ahora_utc - timedelta(hours=3) # Tu ajuste horario

    # Si no envían fechas, usamos los últimos 7 días por defecto
    if start_date_str:
        fecha_inicio = parse_date(start_date_str)
    else:
        fecha_inicio = (ahora_arg - timedelta(days=6)).date()

    if end_date_str:
        fecha_fin = parse_date(end_date_str)
    else:
        fecha_fin = ahora_arg.date()

    # 2. Filtrar Ventas y Gastos en ese rango estricto
    # Usamos __date__gte (mayor o igual) y __date__lte (menor o igual)
    ventas_rango = Venta.objects.filter(
        fecha__date__gte=fecha_inicio, 
        fecha__date__lte=fecha_fin
    )
    gastos_rango = Gasto.objects.filter(
        fecha__date__gte=fecha_inicio, 
        fecha__date__lte=fecha_fin
    )

    # 3. Calcular KPIs Totales del Periodo Seleccionado
    total_ventas = sum(v.total for v in ventas_rango)
    total_gastos = sum(g.monto for g in gastos_rango)
    
    cantidad_perfumes = 0
    for v in ventas_rango:
        detalles = DetalleVenta.objects.filter(venta=v)
        for d in detalles:
            cantidad_perfumes += d.cantidad

    stock_bajo = Producto.objects.filter(stock__lt=5).count()
    ganancia_neta = total_ventas - total_gastos

    # 4. Generar Datos para el Gráfico (Día a día dentro del rango)
    datos_grafico = []
    labels_grafico = []
    
    # Calculamos cuántos días hay en el rango seleccionado
    delta_dias = (fecha_fin - fecha_inicio).days
    
    # Bucle día por día para llenar el gráfico
    for i in range(delta_dias + 1):
        dia_actual = fecha_inicio + timedelta(days=i)
        
        suma_dia = 0
        # Filtramos en memoria las ventas de ese día específico para el gráfico
        for venta in ventas_rango:
            fecha_venta_local = (venta.fecha - timedelta(hours=3)).date()
            if fecha_venta_local == dia_actual:
                suma_dia += float(venta.total)
        
        datos_grafico.append(suma_dia)
        labels_grafico.append(dia_actual.strftime("%d/%m"))

    return Response({
        'grafico': datos_grafico,
        'labels': labels_grafico,
        'ventas_hoy': total_ventas,      # AHORA ESTO ES "VENTAS DEL PERIODO"
        'cantidad_perfumes': cantidad_perfumes,
        'stock_bajo': stock_bajo,
        'gastos_hoy': total_gastos,      # AHORA ESTO ES "GASTOS DEL PERIODO"
        'ganancia_neta': ganancia_neta
    })