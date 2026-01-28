from rest_framework import serializers
from .models import Producto, Venta, DetalleVenta, Gasto

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'

class DetalleVentaSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.ReadOnlyField(source='producto.nombre')
    class Meta:
        model = DetalleVenta
        fields = ['nombre_producto', 'cantidad', 'subtotal']

class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    fecha_formateada = serializers.DateTimeField(format="%d/%m/%Y %H:%M", source='fecha', read_only=True)
    class Meta:
        model = Venta
        fields = ['id', 'fecha', 'fecha_formateada', 'total', 'detalles']

# --- NUEVO SERIALIZER ---
class GastoSerializer(serializers.ModelSerializer):
    fecha_formateada = serializers.DateTimeField(format="%d/%m/%Y %H:%M", source='fecha', read_only=True)
    class Meta:
        model = Gasto
        fields = ['id', 'descripcion', 'monto', 'fecha', 'fecha_formateada']