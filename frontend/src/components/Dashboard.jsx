import { useState, useEffect } from 'react'
import api from '../api/axiosConfig'
import Inventario from './Inventario'
import Ventas from './Ventas'
import Historial from './Historial'
import Gastos from './Gastos'
import logo from '../assets/logo.png' 

function Dashboard({ logout }) {
  const [activeTab, setActiveTab] = useState('inicio')
  
  // --- ESTADOS PARA FILTROS ---
  const hoy = new Date().toISOString().split('T')[0]
  // Calculamos hace 7 días
  const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [fechaInicio, setFechaInicio] = useState(haceUnaSemana)
  const [fechaFin, setFechaFin] = useState(hoy)
  const [tituloPeriodo, setTituloPeriodo] = useState('Últimos 7 días')

  // Detector de Móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [ventasData, setVentasData] = useState([])
  const [labels, setLabels] = useState([])
  const [kpis, setKpis] = useState({ ventasHoy: 0, perfumesVendidos: 0, stockBajo: 0, gastosHoy: 0, gananciaNeta: 0 })
  const [loading, setLoading] = useState(false)

  // --- FUNCIÓN MEJORADA PARA TRAER DATOS ---
  // Acepta argumentos opcionales. Si no se pasan, usa el estado actual.
  const fetchDashboard = (inicioOverride, finOverride) => {
    setLoading(true)
    
    // Usamos el valor que nos pasan O el del estado si no nos pasan nada
    const start = inicioOverride || fechaInicio
    const end = finOverride || fechaFin

    console.log("Consultando API con:", start, end) // <--- Para depurar

    const token = localStorage.getItem('token')
    
    api.get(`/api/dashboard/?start_date=${start}&end_date=${end}`, {
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
    .catch(err => { console.error(err); setLoading(false) })
  }

  // Cargar datos al entrar
  useEffect(() => {
    if (activeTab === 'inicio') {
      fetchDashboard() 
    }
  }, [activeTab])

  // --- BOTONES RÁPIDOS CORREGIDOS ---
  const filtrarSemana = () => {
    const today = new Date()
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    
    const fInicio = lastWeek.toISOString().split('T')[0]
    const fFin = today.toISOString().split('T')[0]

    // Actualizamos los inputs visuales
    setFechaInicio(fInicio)
    setFechaFin(fFin)
    setTituloPeriodo('Últimos 7 días')

    // LLAMAMOS DIRECTAMENTE con los valores nuevos (sin esperar al estado)
    fetchDashboard(fInicio, fFin)
  }

  const filtrarMes = () => {
    const date = new Date()
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const fInicio = firstDay.toISOString().split('T')[0]
    const fFin = lastDay.toISOString().split('T')[0]

    setFechaInicio(fInicio)
    setFechaFin(fFin)
    setTituloPeriodo('Este Mes')

    fetchDashboard(fInicio, fFin)
  }

  const handleManualFilter = () => {
    setTituloPeriodo(`Del ${fechaInicio} al ${fechaFin}`)
    // Aquí sí usamos el estado porque el usuario ya escribió en los inputs
    fetchDashboard(fechaInicio, fechaFin)
  }

  // Gráfico
  const maxVenta = Math.max(...ventasData, 10000)
  const getPoints = () => ventasData.map((v, i) => `${(i / (ventasData.length - 1)) * 100},${100 - ((v / maxVenta) * 80)}`).join(' ')

  const styles = {
    container: { height: '100vh', width: '100vw', backgroundColor: '#050505', color: 'white', fontFamily: 'sans-serif', display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' },
    sidebar: isMobile ? { position: 'fixed', bottom: 0, left: 0, width: '100%', height: '70px', background: '#18181b', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000, padding: '0 10px' } : { width: '250px', background: 'rgba(20, 20, 20, 0.9)', borderRight: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
    logo: isMobile ? { display: 'none' } : { width: '100px', height: 'auto', marginBottom: '15px', borderRadius: '10px', filter: 'invert(1) grayscale(1) brightness(1.5)' },
    content: { flex: 1, padding: isMobile ? '20px' : '40px', paddingBottom: isMobile ? '90px' : '40px', overflowY: 'auto', height: '100%', backgroundImage: 'radial-gradient(circle at top left, rgba(147,51,234,0.1), transparent 40%)', boxSizing: 'border-box' },
    menuContainer: isMobile ? { display: 'flex', width: '100%', justifyContent: 'space-evenly' } : { width: '100%' },
    menuItem: (isActive) => ({ padding: isMobile ? '10px' : '15px 20px', marginBottom: isMobile ? '0' : '10px', borderRadius: '12px', cursor: 'pointer', background: isActive ? (isMobile ? 'transparent' : 'linear-gradient(90deg, rgba(236, 72, 153, 0.2), transparent)') : 'transparent', borderLeft: (!isMobile && isActive) ? '4px solid #db2777' : '4px solid transparent', color: isActive ? '#db2777' : '#888', fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s', width: isMobile ? 'auto' : '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: isMobile ? '0.8rem' : '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }),
    card: { background: 'rgba(25, 25, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', marginBottom: '20px', backdropFilter: 'blur(10px)' },
    chartContainer: { height: '250px', width: '100%', position: 'relative', marginTop: '20px' },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' },
    
    filterBar: {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '10px',
        marginBottom: '20px',
        background: 'rgba(255,255,255,0.05)',
        padding: '15px',
        borderRadius: '12px',
        alignItems: 'center'
    },
    dateInput: {
        background: '#111',
        border: '1px solid #333',
        color: 'white',
        padding: '8px',
        borderRadius: '6px',
        outline: 'none',
        colorScheme: 'dark' // Para que el calendario se vea oscuro
    },
    filterBtn: { background: '#333', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
    primaryBtn: { background: '#db2777', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }
  }

  const renderIcon = (tab, label) => (
     <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
        <span style={{fontSize: '1.2rem', marginBottom: isMobile ? '2px' : '0', marginRight: isMobile ? '0' : '10px'}}>{tab === 'inicio' ? '🏠' : tab === 'ventas' ? '🛒' : tab === 'inventario' ? '📦' : tab === 'historial' ? '📜' : '💸'}</span>
        {isMobile && <span>{label}</span>}{!isMobile && label}
     </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        {!isMobile && <img src={logo} alt="Logo" style={styles.logo} />}
        {!isMobile && <h2 style={{ color: 'white', marginBottom: '40px', letterSpacing: '2px', textAlign: 'center', margin: '0 0 40px 0' }}>INSTINTO</h2>}
        <div style={styles.menuContainer}>
            <div style={styles.menuItem(activeTab === 'inicio')} onClick={() => setActiveTab('inicio')}>{isMobile ? renderIcon('inicio', 'Inicio') : '🏠 Inicio'}</div>
            <div style={styles.menuItem(activeTab === 'ventas')} onClick={() => setActiveTab('ventas')}>{isMobile ? renderIcon('ventas', 'Venta') : '🛒 Nueva Venta'}</div>
            <div style={styles.menuItem(activeTab === 'inventario')} onClick={() => setActiveTab('inventario')}>{isMobile ? renderIcon('inventario', 'Stock') : '📦 Control Stock'}</div>
            <div style={styles.menuItem(activeTab === 'historial')} onClick={() => setActiveTab('historial')}>{isMobile ? renderIcon('historial', 'Hist.') : '📜 Historial'}</div>
            <div style={styles.menuItem(activeTab === 'gastos')} onClick={() => setActiveTab('gastos')}>{isMobile ? renderIcon('gastos', 'Gastos') : '💸 Gastos'}</div>
        </div>
        {!isMobile && <div style={{width:'100%', marginTop:'auto'}}><button onClick={logout} style={{ ...styles.menuItem(false), border: '1px solid #333', textAlign: 'center' }}>Cerrar Sesión</button></div>}
        {isMobile && <button onClick={logout} style={{ position: 'fixed', top: '15px', right: '15px', background:'#333', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', zIndex:1001 }}>🚪</button>}
      </div>

      <div style={styles.content}>
        {activeTab === 'inicio' && (
          <div>
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '5px' }}>Resumen</h1>
            <p style={{ color: '#888', marginBottom: '20px' }}>Datos para: <span style={{color:'#db2777', fontWeight:'bold'}}>{tituloPeriodo}</span></p>

            {/* --- BARRA DE FILTROS --- */}
            <div style={styles.filterBar}>
                <button style={styles.filterBtn} onClick={filtrarSemana}>7 Días</button>
                <button style={styles.filterBtn} onClick={filtrarMes}>Este Mes</button>
                
                <div style={{height:'20px', width:'1px', background:'#555', margin:'0 10px'}}></div>
                
                <input type="date" style={styles.dateInput} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                <span style={{color:'#888'}}>a</span>
                <input type="date" style={styles.dateInput} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                
                <button style={styles.primaryBtn} onClick={handleManualFilter}>🔎 Filtrar</button>
            </div>

            <div style={styles.card}>
              <h3 style={{ margin: 0, color: '#db2777', textTransform: 'uppercase', letterSpacing: '1px' }}>TENDENCIA</h3>
              <div style={styles.chartContainer}>
                {loading ? <p style={{textAlign:'center', marginTop:'50px', color:'#888'}}>Cargando datos...</p> : (
                  ventasData.length > 0 ? ( // Cambié > 1 a > 0 para que grafique aunque sea un solo día
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                        <polyline fill="none" stroke="#db2777" strokeWidth="2" points={getPoints()} vectorEffect="non-scaling-stroke" />
                        <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#db2777" stopOpacity="0.2" /><stop offset="100%" stopColor="#db2777" stopOpacity="0" /></linearGradient></defs>
                        <polygon points={`0,100 ${getPoints()} 100,100`} fill="url(#g)" />
                    </svg>
                  ) : <p style={{textAlign:'center', color:'#555', marginTop:'50px'}}>No hay movimientos en este rango.</p>
                )}
                
                {!loading && labels.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginTop: '10px', fontSize: '0.8rem' }}>
                        <span>{labels[0]}</span>
                        {labels.length > 2 && <span>{labels[Math.floor(labels.length / 2)]}</span>}
                        {labels.length > 1 && <span>{labels[labels.length - 1]}</span>}
                    </div>
                )}
              </div>
            </div>

            <div style={styles.kpiGrid}>
                <div style={styles.card}>
                    <div style={{ color: '#888', fontSize:'0.9rem' }}>Ventas Periodo</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>${kpis.ventasHoy.toLocaleString()}</div>
                </div>
                <div style={styles.card}>
                    <div style={{ color: '#888', fontSize:'0.9rem' }}>Gastos Periodo</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f43f5e' }}>-${kpis.gastosHoy.toLocaleString()}</div>
                </div>
                <div style={{...styles.card, border: '1px solid #3b82f6'}}>
                    <div style={{ color: '#60a5fa', fontSize:'0.9rem' }}>Ganancia Neta</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa' }}>${kpis.gananciaNeta.toLocaleString()}</div>
                </div>
                <div style={styles.card}>
                    <div style={{ color: '#888', fontSize:'0.9rem' }}>Stock Bajo</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: kpis.stockBajo > 0 ? '#f87171' : '#fff' }}>{kpis.stockBajo}</div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'ventas' && <Ventas isMobile={isMobile} />} 
        {activeTab === 'inventario' && <Inventario isMobile={isMobile} />}
        {activeTab === 'historial' && <Historial isMobile={isMobile} />}
        {activeTab === 'gastos' && <Gastos isMobile={isMobile} />}
      </div>
    </div>
  )
}

export default Dashboard