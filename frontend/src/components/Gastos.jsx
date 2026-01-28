import { useState, useEffect } from 'react'
import api from '../api/axiosConfig' // <--- CAMBIADO

function Gastos() {
  const [gastos, setGastos] = useState([])
  const [nuevoGasto, setNuevoGasto] = useState({ descripcion: '', monto: '' })
  
  const styles = {
    container: { color: 'white' },
    title: { fontSize: '2rem', marginBottom: '20px' },
    formCard: {
        background: 'rgba(25, 25, 30, 0.6)', padding: '20px', borderRadius: '15px',
        border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px',
        display: 'flex', gap: '10px', alignItems: 'end'
    },
    inputGroup: { display: 'flex', flexDirection: 'column', flex: 1 },
    label: { marginBottom: '5px', color: '#888', fontSize: '0.9rem' },
    input: {
        background: '#111', border: '1px solid #333', color: 'white', padding: '10px',
        borderRadius: '8px', outline: 'none'
    },
    btn: {
        background: '#f43f5e', color: 'white', border: 'none', padding: '10px 20px',
        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', height: '40px'
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

  // Cargar gastos
  useEffect(() => {
    cargarGastos()
  }, [])

  const cargarGastos = () => {
    const token = localStorage.getItem('token')
    // CAMBIADO: api.get y ruta relativa
    api.get('/api/gastos/', { headers: { 'Authorization': `Token ${token}` }})
    .then(res => setGastos(res.data))
  }

  const handleGuardar = () => {
    if(!nuevoGasto.descripcion || !nuevoGasto.monto) return
    const token = localStorage.getItem('token')
    // CAMBIADO: api.post y ruta relativa
    api.post('/api/gastos/', nuevoGasto, { headers: { 'Authorization': `Token ${token}` }})
    .then(() => {
        setNuevoGasto({ descripcion: '', monto: '' })
        cargarGastos()
    })
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💸 Registro de Gastos</h1>
      
      {/* FORMULARIO */}
      <div style={styles.formCard}>
        <div style={styles.inputGroup}>
            <label style={styles.label}>Descripción</label>
            <input 
                style={styles.input} 
                placeholder="Ej: Alquiler, Luz, Comida..." 
                value={nuevoGasto.descripcion}
                onChange={e => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
            />
        </div>
        <div style={{...styles.inputGroup, maxWidth: '150px'}}>
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
        <h3 style={{marginTop:0, color: '#888'}}>Últimos Gastos</h3>
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