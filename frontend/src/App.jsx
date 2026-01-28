import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard' // <--- IMPORTAMOS EL NUEVO DASHBOARD

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleSetToken = (newToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
  }

  // Si NO hay token, mostramos Login
  if (!token) {
    return <Login setToken={handleSetToken} />
  }

  // Si SÍ hay token, mostramos el Dashboard completo
  return <Dashboard logout={handleLogout} />
}

export default App