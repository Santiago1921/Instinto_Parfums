import { useState, useEffect } from 'react'
import api from '../api/axiosConfig'
import Swal from 'sweetalert2'

// Recibimos isMobile desde el Dashboard
function Ventas({ isMobile }) {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  
  // Estados del formulario
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [precioVenta, setPrecioVenta] = useState('') 
  
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

  const handleProductoChange = (e) => {
    const id = e.target.value
    setProductoSeleccionado(id)
    const prod = productos.find(p => p.id === parseInt(id))
    if (prod) {
        setPrecioVenta(prod.precio)
    } else {
        setPrecioVenta('')
    }
  }

  const agregarAlCarrito = (e) => {
    e.preventDefault()
    if (!productoSeleccionado || !precioVenta) return 

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
      precio: parseFloat(precioVenta), 
      cantidad: parseInt(cantidad),
      subtotal: parseFloat(precioVenta) * parseInt(cantidad) 
    }

    const nuevoCarrito = [...carrito, nuevoItem]
    setCarrito(nuevoCarrito)
    
    const nuevoTotal = nuevoCarrito.reduce((acc, item) => acc + item.subtotal, 0)
    setTotal(nuevoTotal)
    
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

  // --- ESTILOS RESPONSIVOS ---
  const styles = {
    // Si es movil 1 columna, si es PC 2 columnas
    container: { 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: '30px', 
        // En movil dejamos que la altura sea automatica (scroll), en PC llenamos
        height: isMobile ? 'auto' : '100%',
        alignContent: 'start' // Alinea el contenido arriba
    },
    
    panel: { 
        background: 'rgba(25, 25, 30, 0.6)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '20px', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        padding: isMobile ? '20px' : '30px', // Menos relleno en celular
        display: 'flex', 
        flexDirection: 'column' 
    },
    
    title: { margin: '0 0 20px 0', color: '#db2777', textTransform: 'uppercase', letterSpacing: '1px', fontSize: isMobile ? '1.2rem' : '1.5rem' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' },
    select: { width: '100%', padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: 'white', outline: 'none', fontSize: '1rem' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: 'white', outline: 'none', fontSize: '1rem' },
    addButton: { width: '100%', padding: '15px', background: 'linear-gradient(90deg, #9333ea, #db2777)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' },
    
    // Tabla con scroll horizontal si es muy pequeña la pantalla
    tableContainer: { overflowX: 'auto' }, 
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '300px' }, // minWidth asegura que no se rompa feo
    
    th: { textAlign: 'left', color: '#888', padding: '10px 0', borderBottom: '1px solid #333', fontSize: isMobile ? '0.8rem' : '1rem' },
    td: { padding: '10px 0', borderBottom: '1px solid #222', fontSize: isMobile ? '0.9rem' : '1rem' },
    
    totalContainer: { marginTop: 'auto', textAlign: 'right', borderTop: '1px solid #333', paddingTop: '20px' },
    totalLabel: { fontSize: '1.2rem', color: '#888' },
    totalValue: { fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 'bold', color: '#4ade80', textShadow: '0 0 15px rgba(74, 222, 128, 0.3)' },
    pagarButton: { width: '100%', padding: '15px', background: '#4ade80', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '20px', cursor: 'pointer' }
  }

  return (
    <div style={styles.container}>
      {/* PANEL 1: FORMULARIO */}
      <div style={styles.panel}>
        <h2 style={styles.title}>📦 Agregar</h2>
        <form onSubmit={agregarAlCarrito}>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Producto</label>
            <select style={styles.select} value={productoSeleccionado} onChange={handleProductoChange}>
              <option value="">-- Seleccionar --</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>

          {/* En celular ponemos precio y cantidad en la misma fila para ahorrar espacio */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Precio ($)</label>
                <input type="number" style={styles.input} value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} placeholder="0.00" />
            </div>
            <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Cant.</label>
                <input type="number" min="1" style={styles.input} value={cantidad} onChange={e => setCantidad(e.target.value)} />
            </div>
          </div>

          <button type="submit" style={styles.addButton}>+ AGREGAR</button>
        </form>
      </div>

      {/* PANEL 2: TICKET */}
      <div style={styles.panel}>
        <h2 style={{...styles.title, color: '#fff'}}>🧾 Ticket</h2>
        <div style={styles.tableContainer}>
            <table style={styles.table}>
            <thead>
                <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Prod.</th>
                    {!isMobile && <th style={{...styles.th, textAlign: 'right'}}>Unit.</th>} {/* Ocultamos unitario en movil si quieres ahorrar espacio, o lo dejas */}
                    <th style={{...styles.th, textAlign: 'right'}}>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {carrito.map((item, index) => (
                    <tr key={index}>
                        <td style={styles.td}>{item.cantidad}</td>
                        <td style={styles.td}>{item.nombre}</td>
                        {!isMobile && <td style={{...styles.td, textAlign: 'right', color:'#aaa'}}>${item.precio}</td>}
                        <td style={{...styles.td, textAlign: 'right'}}>${item.subtotal}</td>
                    </tr>
                ))}
                {carrito.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#555'}}>Vacío</td></tr>}
            </tbody>
            </table>
        </div>
        
        <div style={styles.totalContainer}>
          <div style={styles.totalLabel}>TOTAL</div>
          <div style={styles.totalValue}>${total}</div>
          {carrito.length > 0 && <button style={styles.pagarButton} onClick={handleConfirmarVenta}>COBRAR 💸</button>}
        </div>
      </div>
    </div>
  )
}

export default Ventas