import { useState, useEffect } from 'react'
import api from '../api/axiosConfig'

// Recibimos la prop isMobile
function Historial({ isMobile }) {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    api.get('/api/ventas/', {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => {
      setVentas(res.data)
      setLoading(false)
    })
    .catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  // --- ESTILOS RESPONSIVOS ---
  const styles = {
    // Padding bottom extra en móvil para que el menú no tape el final
    container: { color: 'white', paddingBottom: isMobile ? '80px' : '0' },
    
    title: { fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '20px', textAlign: isMobile ? 'center' : 'left' },
    
    tableContainer: {
        background: 'rgba(25, 25, 30, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: isMobile ? '10px' : '20px', // Menos padding en móvil
        border: '1px solid rgba(255,255,255,0.05)',
        overflowX: 'auto', // <--- CLAVE: Permite deslizar horizontalmente en móvil
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' }, // Ancho mínimo para forzar scroll si es necesario
    
    th: { 
        textAlign: 'left', 
        padding: '15px', 
        borderBottom: '1px solid #333', 
        color: '#db2777', 
        textTransform: 'uppercase', 
        fontSize: '0.85rem',
        whiteSpace: 'nowrap' // Evita que el título se parta en dos líneas
    },
    
    td: { 
        padding: '15px', 
        borderBottom: '1px solid #222', 
        color: '#ccc',
        fontSize: isMobile ? '0.9rem' : '1rem'
    },
    
    productoTag: {
        display: 'inline-block',
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#60a5fa',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        marginRight: '5px',
        marginBottom: '5px',
        whiteSpace: 'nowrap' // Mantiene el tag en una sola línea
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📜 Historial</h1>
      
      {loading ? (
        <p style={{textAlign: 'center'}}>Cargando historial...</p>
      ) : (
        <div style={styles.tableContainer}>
            {/* Pista visual para el usuario móvil */}
            {isMobile && <div style={{textAlign:'center', fontSize:'0.7rem', color:'#666', paddingBottom:'10px'}}>← Desliza para ver detalles →</div>}
            
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Fecha</th>
                        <th style={styles.th}>Productos Vendidos</th>
                        <th style={styles.th}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {ventas.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                                No hay ventas registradas aún.
                            </td>
                        </tr>
                    ) : (
                        ventas.map((venta) => (
                            <tr key={venta.id}>
                                <td style={styles.td}>#{venta.id}</td>
                                <td style={{...styles.td, whiteSpace:'nowrap'}}>{venta.fecha_formateada}</td>
                                <td style={styles.td}>
                                    {venta.detalles.map((detalle, index) => (
                                        <span key={index} style={styles.productoTag}>
                                            {detalle.cantidad}x {detalle.nombre_producto}
                                        </span>
                                    ))}
                                </td>
                                <td style={{...styles.td, color: '#4ade80', fontWeight: 'bold'}}>
                                    ${parseFloat(venta.total).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      )}
    </div>
  )
}

export default Historial