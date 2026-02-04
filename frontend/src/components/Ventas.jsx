import { useState, useEffect } from 'react'
import api from '../api/axiosConfig'
import Swal from 'sweetalert2'

function Ventas() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  
  // Estados del formulario
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [precioVenta, setPrecioVenta] = useState('') // <--- NUEVO: Para editar precio
  
  const [total, setTotal] = useState(0)

  const cargarProductos = () => {
    const token = localStorage.getItem('token')
    api.get('/api/productos/', {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => setProductos(res.data))
    .catch(err => console.error(err))
  }

  useEffect(() => { cargarProductos() }, [])

  // --- NUEVA FUNCIÓN: Al elegir producto, ponemos su precio original por defecto ---
  const handleProductoChange = (e) => {
    const id = e.target.value
    setProductoSeleccionado(id)

    // Buscamos el producto para sacar su precio base
    const prod = productos.find(p => p.id === parseInt(id))
    if (prod) {
        setPrecioVenta(prod.precio) // Rellenamos el precio automáticamente
    } else {
        setPrecioVenta('')
    }
  }

  const agregarAlCarrito = (e) => {
    e.preventDefault()
    if (!productoSeleccionado || !precioVenta) return // Validamos que haya precio

    const producto = productos.find(p => p.id === parseInt(productoSeleccionado))
    
    if (producto.stock < cantidad) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡No hay suficiente stock!',
        background: '#18181b', color: '#fff', confirmButtonColor: '#db2777'
      })
      return
    }

    const nuevoItem = {
      id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(precioVenta), // <--- USAMOS EL PRECIO EDITADO
      cantidad: parseInt(cantidad),
      subtotal: parseFloat(precioVenta) * parseInt(cantidad) // <--- CÁLCULO CON PRECIO EDITADO
    }

    const nuevoCarrito = [...carrito, nuevoItem]
    setCarrito(nuevoCarrito)
    
    // Recalcular total
    const nuevoTotal = nuevoCarrito.reduce((acc, item) => acc + item.subtotal, 0)
    setTotal(nuevoTotal)
    
    // Resetear formulario
    setCantidad(1)
    setProductoSeleccionado('')
    setPrecioVenta('')
  }

  const handleConfirmarVenta = () => {
    const token = localStorage.getItem('token')
    
    api.post('/api/registrar-venta/', 
      { items: carrito }, 
      { headers: { 'Authorization': `Token ${token}` } }
    )
    .then(response => {
      Swal.fire({
        icon: 'success',
        title: '¡Venta Registrada!',
        text: 'El stock ha sido actualizado.',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#4ade80',
        confirmButtonText: '<span style="color:black; font-weight:bold">GENIAL</span>',
        backdrop: `rgba(0,0,123,0.1)`
      })
      
      setCarrito([])
      setTotal(0)
      cargarProductos()
    })
    .catch(error => {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al procesar la venta.',
        background: '#18181b', color: '#fff'
      })
    })
  }

  const styles = {
    container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', height: '100%' },
    panel: { background: 'rgba(25, 25, 30, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '30px', display: 'flex', flexDirection: 'column' },
    title: { margin: '0 0 20px 0', color: '#db2777', textTransform: 'uppercase', letterSpacing: '1px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' },
    select: { width: '100%', padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: 'white', outline: 'none', fontSize: '1rem' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: 'white', outline: 'none', fontSize: '1rem' },
    addButton: { width: '100%', padding: '15px', background: 'linear-gradient(90deg, #9333ea, #db2777)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', color: '#888', padding: '10px 0', borderBottom: '1px solid #333' },
    td: { padding: '10px 0', borderBottom: '1px solid #222' },
    totalContainer: { marginTop: 'auto', textAlign: 'right', borderTop: '1px solid #333', paddingTop: '20px' },
    totalLabel: { fontSize: '1.2rem', color: '#888' },
    totalValue: { fontSize: '2.5rem', fontWeight: 'bold', color: '#4ade80', textShadow: '0 0 15px rgba(74, 222, 128, 0.3)' },
    pagarButton: { width: '100%', padding: '15px', background: '#4ade80', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '20px', cursor: 'pointer' }
  }

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <h2 style={styles.title}>📦 Agregar Producto</h2>
        <form onSubmit={agregarAlCarrito}>
          
          {/* SELECCIÓN DE PRODUCTO */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Producto</label>
            <select 
                style={styles.select} 
                value={productoSeleccionado} 
                onChange={handleProductoChange} // <--- Usamos la nueva función
            >
              <option value="">-- Seleccionar --</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                    {p.nombre} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          {/* NUEVO CAMPO: PRECIO EDITABLE */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Precio de Venta ($)</label>
            <input 
                type="number" 
                style={styles.input} 
                value={precioVenta} 
                onChange={e => setPrecioVenta(e.target.value)} 
                placeholder="0.00"
            />
          </div>

          {/* CANTIDAD */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Cantidad</label>
            <input 
                type="number" 
                min="1" 
                style={styles.input} 
                value={cantidad} 
                onChange={e => setCantidad(e.target.value)} 
            />
          </div>

          <button type="submit" style={styles.addButton}>+ AGREGAR AL TICKET</button>
        </form>
      </div>

      <div style={styles.panel}>
        <h2 style={{...styles.title, color: '#fff'}}>🧾 Ticket de Venta</h2>
        <table style={styles.table}>
          <thead>
            <tr>
                <th style={styles.th}>Cant.</th>
                <th style={styles.th}>Producto</th>
                <th style={{...styles.th, textAlign: 'right'}}>Precio Unit.</th> {/* Agregué columna precio unitario */}
                <th style={{...styles.th, textAlign: 'right'}}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item, index) => (
                <tr key={index}>
                    <td style={styles.td}>{item.cantidad}</td>
                    <td style={styles.td}>{item.nombre}</td>
                    <td style={{...styles.td, textAlign: 'right', color:'#aaa'}}>${item.precio}</td>
                    <td style={{...styles.td, textAlign: 'right'}}>${item.subtotal}</td>
                </tr>
            ))}
            {carrito.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#555'}}>Carrito vacío</td></tr>}
          </tbody>
        </table>
        <div style={styles.totalContainer}>
          <div style={styles.totalLabel}>TOTAL A PAGAR</div>
          <div style={styles.totalValue}>${total}</div>
          {carrito.length > 0 && <button style={styles.pagarButton} onClick={handleConfirmarVenta}>CONFIRMAR VENTA 💸</button>}
        </div>
      </div>
    </div>
  )
}

export default Ventas