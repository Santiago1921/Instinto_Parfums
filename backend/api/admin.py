from django.contrib import admin
from .models import Producto, Venta, DetalleVenta

class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 0

class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'total', 'usuario')
    inlines = [DetalleVentaInline] # Esto permite ver los productos dentro de la venta

admin.site.register(Producto)
admin.site.register(Venta, VentaAdmin)
admin.site.register(DetalleVenta)