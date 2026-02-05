import { useState, useEffect } from 'react'
import api from '../api/axiosConfig' 

// --- IMPORTAMOS LAS IMÁGENES LOCALES ---
import logoImg from '../assets/logo.png' 
import fondoImg from '../assets/fondo.jpg'

function Login({ setToken }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [hoverButton, setHoverButton] = useState(false)

  // --- 1. DETECTOR DE MOVIL ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  // ---------------------------

  const handleLogin = (e) => {
    e.preventDefault()
    api.post('/api-token-auth/', { username, password })
    .then(response => {
      setToken(response.data.token) 
    })
    .catch(err => {
      console.error(err)
      setError('Credenciales incorrectas')
    })
  }

  // --- ESTILOS RESPONSIVOS ---
  const styles = {
    mainWrapper: {
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      backgroundColor: '#000000',
      backgroundImage: `
        linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)),
        url(${fondoImg})
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 0,
      padding: '20px' // Agregamos padding al fondo para evitar bordes pegados
    },
    loginCard: {
      background: 'rgba(20, 20, 20, 0.7)', 
      backdropFilter: 'blur(15px)', 
      // EN MOVIL: Menos padding para aprovechar espacio
      padding: isMobile ? '30px 20px' : '50px', 
      borderRadius: '24px', 
      border: '1px solid rgba(255, 255, 255, 0.1)',
      // EN MOVIL: 100% del ancho disponible. EN PC: Max 400px
      width: isMobile ? '100%' : '400px', 
      maxWidth: '400px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', 
      zIndex: 10,
      animation: 'fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      opacity: 0, 
      transform: 'translateY(30px)' 
    },
    logoImage: {
        // EN MOVIL: Un poco más chico
        width: isMobile ? '80px' : '100px', 
        height: 'auto', 
        marginBottom: '20px',
        filter: 'invert(1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
        animation: 'float 6s ease-in-out infinite'
    },
    title: {
      color: '#fff', 
      fontSize: isMobile ? '1.8rem' : '2.2rem', // Letra más chica en móvil
      fontWeight: '700', 
      marginBottom: '0.5rem',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      fontFamily: 'monospace',
      textShadow: '0 2px 10px rgba(0,0,0,0.5)',
      textAlign: 'center'
    },
    subtitle: {
        color: '#ccc',
        marginBottom: '30px',
        fontSize: '0.8rem',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    input: {
      width: '100%', 
      padding: '16px', 
      borderRadius: '8px', 
      border: '1px solid rgba(255,255,255,0.2)',
      background: 'rgba(0,0,0,0.6)', 
      color: 'white', 
      marginBottom: '15px', 
      fontSize: '1rem', 
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box' // Importante para que el padding no rompa el ancho
    },
    button: {
      width: '100%', 
      padding: '16px', 
      marginTop: '10px',
      background: '#ffffff', 
      color: 'black',
      border: 'none', 
      borderRadius: '8px', 
      fontSize: '0.9rem', 
      fontWeight: '900', 
      cursor: 'pointer',
      letterSpacing: '1px',
      transform: hoverButton ? 'scale(1.02)' : 'scale(1)', 
      boxShadow: hoverButton ? '0 0 20px rgba(255, 255, 255, 0.4)' : 'none',
      transition: 'all 0.3s ease'
    },
    errorMessage: {
        color: '#f87171', 
        fontSize: '0.9rem', 
        marginBottom: '15px', 
        textAlign: 'center',
        background: 'rgba(0,0,0,0.5)',
        padding: '5px 10px',
        borderRadius: '4px'
    }
  }

  return (
    <div style={styles.mainWrapper}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      
      <div style={styles.loginCard}>
        <img src={logoImg} alt="Logo Instinto" style={styles.logoImage} />

        <h1 style={styles.title}>Instinto Parfums</h1>
        <p style={styles.subtitle}>Bienvenido Victor</p>
        
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          <input 
            style={styles.input} 
            type="text" 
            placeholder="Usuario" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#ffffff'} 
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
          />
          
          <input 
            style={styles.input} 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#ffffff'} 
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
          />
          
          <button 
            style={styles.button} 
            type="submit" 
            onMouseEnter={() => setHoverButton(true)} 
            onMouseLeave={() => setHoverButton(false)}
          >
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login