import { useState, useEffect } from 'react'
import api from '../api/axiosConfig'
import Inventario from './Inventario'
import Ventas from './Ventas'
import Historial from './Historial'
import Gastos from './Gastos'

import logo from '../assets/logo.png' 

function Dashboard({ logout }) {
  const [activeTab, setActiveTab] = useState('inicio')
  
  const [ventasData, setVentasData] = useState([0,0,0,0,0,0,0])
  const [labels, setLabels] = useState(['', '', '', '', '', '', ''])
  const [kpis, setKpis] = useState({ 
    ventasHoy: 0, 
    perfumesVendidos: 0, 
    stockBajo: 0,
    gastosHoy: 0,
    gananciaNeta: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeTab === 'inicio') {
      const token = localStorage.getItem('token')
      api.get('/api/dashboard/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      .then(res => {
        setVentasData(res.data.grafico)
        setLabels(res.data.labels)
        setKpis({ 
          ventasHoy: res.data.ventas_hoy, 
          perfumesVendidos: res.data.cantidad_perfumes, 
          stockBajo: res.data.stock_bajo,
          gastosHoy: res.data.gastos_hoy || 0,
          gananciaNeta: res.data.ganancia_neta || 0
        })
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
    }
  }, [activeTab])

  const maxVenta = Math.max(...ventasData, 10000)
  const getPoints = () => {
    return ventasData.map((valor, index) => {
      const x = (index / (ventasData.length - 1)) * 100 
      const y = 100 - ((valor / maxVenta) * 80)
      return `${x},${y}`
    }).join(' ')
  }

  // --- ESTILOS CORREGIDOS PARA EL SCROLL ---
  const styles = {
    // 1. Fijamos la altura al tamaño de la ventana y ocultamos el scroll global
    container: { 
        height: '100vh', 
        width: '100vw',
        backgroundColor: '#050505', 
        color: 'white', 
        fontFamily: 'sans-serif', 
        display: 'flex',
        overflow: 'hidden' // <--- IMPORTANTE: Evita scroll doble
    },
    
    sidebar: { 
        width: '250px', 
        background: 'rgba(20, 20, 20, 0.9)', 
        borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        flexShrink: 0 // <--- IMPORTANTE: Evita que el menú se aplaste
    },
    
    logo: { width: '100px', height: 'auto', marginBottom: '15px', borderRadius: '10px', filter: 'invert(1) grayscale(1) brightness(1.5)' },
    
    // 2. Hacemos que el contenido tenga su propio scroll independiente
    content: { 
        flex: 1, 
        padding: '40px', 
        overflowY: 'auto', // <--- IMPORTANTE: Habilita el scroll aquí
        height: '100%',    // <--- IMPORTANTE: Ocupa todo el alto disponible
        backgroundImage: 'radial-gradient(circle at top left, rgba(147,51,234,0.1), transparent 40%)',
        boxSizing: 'border-box'
    },
    
    menuContainer: { width: '100%' },
    menuItem: (isActive) => ({ padding: '15px 20px', marginBottom: '10px', borderRadius: '12px', cursor: 'pointer', background: isActive ? 'linear-gradient(90deg, rgba(236, 72, 153, 0.2), transparent)' : 'transparent', borderLeft: isActive ? '4px solid #db2777' : '4px solid transparent', color: isActive ? 'white' : '#888', fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s', width: '100%', boxSizing: 'border-box' }),
    card: { background: 'rgba(25, 25, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '30px', marginBottom: '30px', backdropFilter: 'blur(10px)' },
    chartContainer: { height: '300px', width: '100%', position: 'relative', marginTop: '20px' },
    
    // 3. Grid Responsivo (para que no se rompa en pantallas chicas)
    kpiGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // <--- MEJORA: Se adapta si la pantalla es chica
        gap: '20px'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h2 style={{ color: 'white', marginBottom: '40px', letterSpacing: '2px', textAlign: 'center', margin: '0 0 40px 0' }}>INSTINTO</h2>
        
        <div style={styles.menuContainer}>
            <div style={styles.menuItem(activeTab === 'inicio')} onClick={() => setActiveTab('inicio')}>🏠 Inicio</div>
            <div style={styles.menuItem(activeTab === 'ventas')} onClick={() => setActiveTab('ventas')}>🛒 Nueva Venta</div>
            <div style={styles.menuItem(activeTab === 'inventario')} onClick={() => setActiveTab('inventario')}>📦 Control Stock</div>
            <div style={styles.menuItem(activeTab === 'historial')} onClick={() => setActiveTab('historial')}>📜 Historial</div>
            <div style={styles.menuItem(activeTab === 'gastos')} onClick={() => setActiveTab('gastos')}>💸 Gastos</div>
        </div>

        <div style={{ flex: 1 }}></div>
        <div style={styles.menuContainer}>
            <button onClick={logout} style={{ ...styles.menuItem(false), border: '1px solid #333', textAlign: 'center' }}>Cerrar Sesión</button>
        </div>
      </div>

      <div style={styles.content}>
        {activeTab === 'inicio' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Resumen Semanal</h1>
            <p style={{ color: '#888', marginBottom: '30px' }}>Datos en tiempo real.</p>

            <div style={styles.card}>
              <h3 style={{ margin: 0, color: '#db2777', textTransform: 'uppercase', letterSpacing: '1px' }}>Tendencia de Ventas</h3>
              <div style={styles.chartContainer}>
                {loading ? <p style={{textAlign:'center', color:'#555'}}>Cargando...</p> : (
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#333" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#333" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#333" strokeWidth="0.5" strokeDasharray="2" />
                      <polyline fill="none" stroke="#db2777" strokeWidth="2" points={getPoints()} style={{ filter: 'drop-shadow(0 0 8px rgba(219, 39, 119, 0.6))' }} vectorEffect="non-scaling-stroke" />
                      <defs><linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#db2777" stopOpacity="0.2" /><stop offset="100%" stopColor="#db2777" stopOpacity="0" /></linearGradient></defs>
                      <polygon points={`0,100 ${getPoints()} 100,100`} fill="url(#gradientArea)" />
                  </svg>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginTop: '10px', fontSize: '0.8rem' }}>
                    {labels.map((lbl, i) => <span key={i}>{lbl}</span>)}
                </div>
              </div>
            </div>

            {/* USAMOS EL NUEVO GRID RESPONSIVO */}
            <div style={styles.kpiGrid}>
                <div style={styles.card}>
                    <div style={{ color: '#888' }}>Ventas Hoy</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80' }}>
                        ${kpis.ventasHoy.toLocaleString()}
                    </div>
                </div>
                
                <div style={styles.card}>
                    <div style={{ color: '#888' }}>Gastos Hoy</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f43f5e' }}>
                        -${kpis.gastosHoy.toLocaleString()}
                    </div>
                </div>

                <div style={{...styles.card, border: '1px solid #3b82f6'}}>
                    <div style={{ color: '#60a5fa' }}>Ganancia Neta</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>
                        ${kpis.gananciaNeta.toLocaleString()}
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={{ color: '#888' }}>Stock Bajo</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: kpis.stockBajo > 0 ? '#f87171' : '#fff' }}>
                        {kpis.stockBajo}
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'ventas' && <Ventas />}
        {activeTab === 'inventario' && <Inventario />}
        {activeTab === 'historial' && <Historial />}
        {activeTab === 'gastos' && <Gastos />}

      </div>
    </div>
  )
}

export default Dashboard