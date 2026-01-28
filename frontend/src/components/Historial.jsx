import { useState, useEffect } from 'react'
import api from '../api/axiosConfig' // <--- CAMBIADO

function Historial() {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    // CAMBIADO: api.get y ruta relativa
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

  const styles = {
    container: { color: 'white' },
    title: { fontSize: '2rem', marginBottom: '20px' },
    tableContainer: {
        background: 'rgba(25, 25, 30, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.05)',
        overflowX: 'auto' // Para que no se rompa en pantallas chicas
    },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
    th: { textAlign: 'left', padding: '15px', borderBottom: '1px solid #333', color: '#db2777', textTransform: 'uppercase', fontSize: '0.85rem' },
    td: { padding: '15px', borderBottom: '1px solid #222', color: '#ccc' },
    productoTag: {
        display: 'inline-block',
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#60a5fa',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        marginRight: '5px',
        marginBottom: '5px'
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📜 Historial de Ventas</h1>
      
      {loading ? (
        <p>Cargando historial...</p>
      ) : (
        <div style={styles.tableContainer}>
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
                                <td style={styles.td}>{venta.fecha_formateada}</td>
                                <td style={styles.td}>
                                    {/* Mapeamos los productos dentro de la celda */}
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