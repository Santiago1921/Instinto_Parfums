import { useState, useEffect } from 'react'
import api from '../api/axiosConfig'

// Recibimos isMobile
function Gastos({ isMobile }) {
  const [gastos, setGastos] = useState([])
  const [nuevoGasto, setNuevoGasto] = useState({ descripcion: '', monto: '' })
  
  // Cargar gastos
  useEffect(() => {
    cargarGastos()
  }, [])

  const cargarGastos = () => {
    const token = localStorage.getItem('token')
    api.get('/api/gastos/', { headers: { 'Authorization': `Token ${token}` }})
    .then(res => setGastos(res.data))
    .catch(err => console.error(err))
  }

  const handleGuardar = () => {
    if(!nuevoGasto.descripcion || !nuevoGasto.monto) return
    const token = localStorage.getItem('token')
    api.post('/api/gastos/', nuevoGasto, { headers: { 'Authorization': `Token ${token}` }})
    .then(() => {
        setNuevoGasto({ descripcion: '', monto: '' })
        cargarGastos()
    })
  }

  // --- ESTILOS RESPONSIVOS ---
  const styles = {
    // Espacio abajo para el menú móvil
    container: { color: 'white', paddingBottom: isMobile ? '80px' : '0' },
    
    title: { fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '20px', textAlign: isMobile ? 'center' : 'left' },
    
    formCard: {
        background: 'rgba(25, 25, 30, 0.6)', padding: '20px', borderRadius: '15px',
        border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px',
        display: 'flex', 
        gap: '10px', 
        // EN MOVIL: Columna (uno abajo del otro). EN PC: Fila (uno al lado del otro)
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'end' 
    },
    
    inputGroup: { display: 'flex', flexDirection: 'column', flex: 1 },
    
    label: { marginBottom: '5px', color: '#888', fontSize: '0.9rem' },
    
    input: {
        background: '#111', border: '1px solid #333', color: 'white', padding: '10px',
        borderRadius: '8px', outline: 'none'
    },
    
    btn: {
        background: '#f43f5e', color: 'white', border: 'none', padding: '10px 20px',
        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', height: '40px',
        marginTop: isMobile ? '10px' : '0' // Un poco de aire en movil
    },
    
    listContainer: {
        background: 'rgba(25, 25, 30, 0.6)', padding: '20px', borderRadius: '15px',
        border: '1px solid rgba(255,255,255,0.05)'
    },
    
    item: {
        display: 'flex', justifyContent: 'space-between', padding: '15px',
        borderBottom: '1px solid #333', alignItems: 'center'
    },
    
    montoGasto: { color: '#f43f5e', fontWeight: 'bold', fontSize: '1.2rem' }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💸 Gastos</h1>
      
      {/* FORMULARIO */}
      <div style={styles.formCard}>
        <div style={styles.inputGroup}>
            <label style={styles.label}>Descripción</label>
            <input 
                style={styles.input} 
                placeholder="Ej: Alquiler, Luz..." 
                value={nuevoGasto.descripcion}
                onChange={e => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
            />
        </div>
        {/* En móvil quitamos el ancho máximo para que ocupe todo el ancho */}
        <div style={{...styles.inputGroup, maxWidth: isMobile ? '100%' : '150px'}}>
            <label style={styles.label}>Monto</label>
            <input 
                style={styles.input} 
                type="number" 
                placeholder="$0.00" 
                value={nuevoGasto.monto}
                onChange={e => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
            />
        </div>
        <button style={styles.btn} onClick={handleGuardar}>Registrar</button>
      </div>

      {/* LISTADO */}
      <div style={styles.listContainer}>
        <h3 style={{marginTop:0, color: '#888', fontSize: isMobile ? '1rem' : '1.2rem'}}>Últimos Gastos</h3>
        {gastos.length === 0 && <p style={{color:'#666', textAlign:'center'}}>No hay gastos registrados.</p>}
        
        {gastos.map(g => (
            <div key={g.id} style={styles.item}>
                <div>
                    <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{g.descripcion}</div>
                    <div style={{fontSize:'0.8rem', color:'#666'}}>{g.fecha_formateada}</div>
                </div>
                <div style={styles.montoGasto}>- ${parseFloat(g.monto).toLocaleString()}</div>
            </div>
        ))}
      </div>
    </div>
  )
}

export default Gastos