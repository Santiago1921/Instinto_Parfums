import { useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import Swal from 'sweetalert2'

function Inventario({ isMobile }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showModal, setShowModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEdicion, setIdEdicion] = useState(null)

  const [formulario, setFormulario] = useState({
    nombre: '', marca: '', codigo: '', precio: '', precio_costo: '', stock: ''
  })

  const Toast = Swal.mixin({
    background: '#18181b',
    color: '#ffffff',
    confirmButtonColor: '#db2777',
    cancelButtonColor: '#52525b'
  })

  const cargarProductos = () => {
    const token = localStorage.getItem('token')
    api.get('/api/productos/', {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => {
      setProductos(res.data)
      setLoading(false)
    })
    .catch(err => setLoading(false))
  }

  useEffect(() => { cargarProductos() }, [])

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }

  const abrirModalCrear = () => {
    setModoEdicion(false)
    setFormulario({ nombre: '', marca: '', codigo: '', precio: '', precio_costo: '', stock: '' })
    setShowModal(true)
  }

  const abrirModalEditar = (producto) => {
    setModoEdicion(true)
    setIdEdicion(producto.id)
    setFormulario({
      nombre: producto.nombre, 
      marca: producto.marca,
      codigo: producto.codigo, 
      precio: producto.precio, 
      precio_costo: producto.precio_costo || 0,
      stock: producto.stock
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Token ${token}` }

    const peticion = modoEdicion 
      ? api.put(`/api/productos/${idEdicion}/`, formulario, { headers })
      : api.post('/api/productos/', formulario, { headers })

    peticion
      .then(() => {
        Toast.fire({
            icon: 'success',
            title: modoEdicion ? '¡Producto actualizado!' : '¡Producto creado!',
            showConfirmButton: false,
            timer: 1500
        })
        setShowModal(false)
        cargarProductos()
      })
      .catch(err => {
        Toast.fire({ icon: 'error', title: 'Error al guardar', text: 'Verifica los datos' })
      })
  }

  const borrarProducto = (id) => {
    Toast.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem('token')
            api.delete(`/api/productos/${id}/`, {
                headers: { 'Authorization': `Token ${token}` }
            })
            .then(() => {
                Swal.fire({
                    title: '¡Borrado!',
                    text: 'El producto ha sido eliminado.',
                    icon: 'success',
                    background: '#18181b', color: '#fff', confirmButtonColor: '#db2777'
                })
                cargarProductos()
            })
            .catch(err => Swal.fire('Error', 'No se pudo borrar', 'error'))
        }
    })
  }

  const styles = {
    container: { color: 'white', fontFamily: 'sans-serif', position: 'relative', paddingBottom: isMobile ? '80px' : '0' },
    header: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '30px', gap: isMobile ? '15px' : '0' },
    title: { fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 'bold', margin: 0, color: '#fff', textAlign: isMobile ? 'center' : 'left' },
    addButton: { background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)', border: 'none', padding: '12px 24px', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(219, 39, 119, 0.4)', width: isMobile ? '100%' : 'auto' },
    
    // Aquí está la magia del scroll
    tableContainer: { 
        background: 'rgba(25, 25, 30, 0.6)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '20px', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        overflowX: 'auto', // Permite deslizar
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)' 
    },
    
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }, // Reduje un poco el ancho mínimo
    
    th: { padding: '15px', color: '#db2777', textTransform: 'uppercase', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' },
    td: { padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: '#e5e7eb', whiteSpace: 'nowrap' },
    
    stockBadge: (cant) => ({ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: cant < 5 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(74, 222, 128, 0.2)', color: cant < 5 ? '#f87171' : '#4ade80' }),
    actionBtn: (color) => ({ background: 'transparent', border: `1px solid ${color}`, color: color, padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', marginLeft: '8px', fontSize: '0.8rem' }),
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', padding: '20px' },
    modalContent: { background: '#18181b', padding: isMobile ? '20px' : '40px', borderRadius: '20px', border: '1px solid #333', width: '500px', maxWidth: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
    inputGroup: { marginBottom: '15px', flex: 1 },
    label: { display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#09090b', color: 'white', outline: 'none', boxSizing: 'border-box' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '20px' },
    btnSave: { flex: 1, padding: '12px', background: '#db2777', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnCancel: { flex: 1, padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Inventario</h2>
        <button style={styles.addButton} onClick={abrirModalCrear}>+ Nuevo</button>
      </div>

      <div style={styles.tableContainer}>
        {/* Agregamos una pista visual para el usuario */}
        {isMobile && <div style={{textAlign:'center', fontSize:'0.7rem', color:'#666', padding:'5px'}}>← Desliza para ver más →</div>}
        
        <table style={styles.table}>
          <thead>
            <tr>
                <th style={styles.th}>Producto</th>
                {/* Ocultamos MARCA en celular */}
                {!isMobile && <th style={styles.th}>Marca</th>}
                <th style={styles.th}>Costo</th>
                <th style={styles.th}>Venta</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{...styles.td, textAlign: 'center'}}>Cargando...</td></tr> : productos.map((p) => (
              <tr key={p.id}>
                <td style={{...styles.td, fontWeight: 'bold'}}>{p.nombre}</td>
                {/* Ocultamos MARCA en celular */}
                {!isMobile && <td style={styles.td}>{p.marca}</td>}
                <td style={{...styles.td, color: '#aaa'}}>${p.precio_costo}</td>
                <td style={{...styles.td, color: '#fff', fontWeight:'bold'}}>${p.precio}</td>
                <td style={styles.td}><span style={styles.stockBadge(p.stock)}>{p.stock}</span></td>
                <td style={styles.td}>
                    <button style={styles.actionBtn('#38bdf8')} onClick={() => abrirModalEditar(p)}>✏️</button>
                    <button style={styles.actionBtn('#f87171')} onClick={() => borrarProducto(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{...styles.title, textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem'}}>{modoEdicion ? 'Editar' : 'Agregar'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}><label style={styles.label}>Nombre</label><input style={styles.input} name="nombre" value={formulario.nombre} onChange={handleChange} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Marca</label><input style={styles.input} name="marca" value={formulario.marca} onChange={handleChange} /></div>
              
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px' }}>
                <div style={styles.inputGroup}>
                    <label style={{...styles.label, color: '#db2777'}}>Costo ($)</label>
                    <input style={styles.input} name="precio_costo" type="number" value={formulario.precio_costo} onChange={handleChange} placeholder="0.00" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Venta ($)</label>
                    <input style={styles.input} name="precio" type="number" value={formulario.precio} onChange={handleChange} required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Stock</label>
                    <input style={styles.input} name="stock" type="number" value={formulario.stock} onChange={handleChange} required />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>{modoEdicion ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventario