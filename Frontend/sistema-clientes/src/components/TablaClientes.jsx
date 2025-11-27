import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const TablaClientes = () => {
    // --- ESTADOS GLOBALES ---
    const [tabActual, setTabActual] = useState('clientes'); // 'clientes' o 'reportes'
    const [token, setToken] = useState('');
    
    // --- ESTADOS PARA CLIENTES (TABLA) ---
    const [clientes, setClientes] = useState([]);
    const [busquedaId, setBusquedaId] = useState('');
    
    // --- ESTADOS PARA ZONA PROTEGIDA (DASHBOARD) ---
    const [dataConfidencial, setDataConfidencial] = useState(null);
    const [accesoDenegado, setAccesoDenegado] = useState(false);

    // --- ESTADOS PARA FORMULARIO MODAL (CRUD) ---
    const [showModal, setShowModal] = useState(false);
    const [tituloModal, setTituloModal] = useState('');
    const initialState = { clienteId: 0, nombreCliente: '', direccion: '', pais: '', identificador: '', telefonoPrincipal: '', correoElectronico: '', contactos: [] };
    const [form, setForm] = useState(initialState);
    
    // --- ESTADOS PARA CONTACTOS ---
    const [showModalContactos, setShowModalContactos] = useState(false);
    const [listaContactos, setListaContactos] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    // 🔴 REVISA TUS PUERTOS (7082 o 7282 según tu Swagger)
    const URL_API = "https://localhost:7282/api/Clientes"; 
    const URL_AUTH = "https://localhost:7282/api/Auth";

    // ✅ NUEVO: EXPRESIONES REGULARES (VALIDACIONES)
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const regexTelefono = /^\d{4}-?\d{4}$/; // 8 dígitos (ej. 55555555 o 5555-5555)

    // ==========================================
    // LÓGICA DE CLIENTES (TABLA)
    // ==========================================
    const getClientes = async () => {
        try {
            const response = await axios.get(URL_API);
            setClientes(response.data);
        } catch (error) { console.error(error); }
    };
    
    const buscarPorId = async () => {
        if (!busquedaId) { getClientes(); return; }
        try {
            const response = await axios.get(`${URL_API}/${busquedaId}`);
            setClientes([response.data]);
        } catch (error) { Swal.fire('No encontrado', 'ID no existe', 'warning'); getClientes(); }
    };

    // ==========================================
    // LÓGICA DE SEGURIDAD (JWT)
    // ==========================================
    const generarToken = async () => {
        try {
            const response = await axios.get(`${URL_AUTH}/GenerarToken`);
            setToken(response.data.token);
            setAccesoDenegado(false);
            Swal.fire({ title: 'Token Generado 🔑', text: 'Ahora tienes permiso de administrador por 10 minutos.', icon: 'success', timer: 2000 });
        } catch (error) { Swal.fire('Error', 'No se pudo conectar al servidor de Auth', 'error'); }
    };

    const cerrarSesion = () => {
        setToken('');
        setDataConfidencial(null);
        setTabActual('clientes'); 
        Swal.fire('Sesión Cerrada', 'Token eliminado de memoria', 'info');
    };

    const cargarDatosConfidenciales = async () => {
        if (!token) { setAccesoDenegado(true); return; }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${URL_AUTH}/ResumenConfidencial`, config);
            setDataConfidencial(response.data);
            setAccesoDenegado(false);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setAccesoDenegado(true); setDataConfidencial(null);
            }
        }
    };

    useEffect(() => {
        if (tabActual === 'reportes') cargarDatosConfidenciales();
        else getClientes();
    }, [tabActual]);


    // ==========================================
    // LÓGICA CRUD + VALIDACIONES
    // ==========================================
    const handleChange = (e) => { const { name, value } = e.target; setForm({ ...form, [name]: value }); };
    
    const handleContactoChange = (index, e) => {
        const { name, value } = e.target;
        const n = [...form.contactos];
        n[index][name] = value;
        setForm({ ...form, contactos: n });
    };

    const agregarFilaContacto = () => setForm({ ...form, contactos: [...form.contactos, { nombreContacto: '', puesto: '', telefonoContacto: '', emailContacto: '' }] });
    
    const eliminarFilaContacto = (index) => { const n = form.contactos.filter((_, i) => i !== index); setForm({ ...form, contactos: n }); };
    
    const abrirModal = (opcion, cliente = null) => {
        if (opcion === 1) { setTituloModal('Nuevo Cliente'); setForm(initialState); }
        else { setTituloModal('Editar Cliente'); setForm({ ...cliente, contactos: cliente.contactos || [] }); }
        setShowModal(true);
    };

    // ✅ NUEVO: FUNCIÓN DE VALIDACIÓN
    const validarFormulario = () => {
        // 1. Validar Cliente (Papá)
        if (!form.nombreCliente || !form.identificador) { Swal.fire('Atención', 'Nombre y NIT son obligatorios', 'warning'); return false; }
        if (!regexTelefono.test(form.telefonoPrincipal)) { Swal.fire('Formato Inválido', 'El teléfono principal debe ser de 8 dígitos', 'warning'); return false; }
        if (!regexEmail.test(form.correoElectronico)) { Swal.fire('Formato Inválido', 'El correo del cliente no es válido', 'warning'); return false; }

        // 2. Validar Contactos (Hijos)
        for (let i = 0; i < form.contactos.length; i++) {
            const c = form.contactos[i];
            if (!c.nombreContacto) { Swal.fire('Atención', `El contacto #${i + 1} debe tener nombre`, 'warning'); return false; }
            if (c.telefonoContacto && !regexTelefono.test(c.telefonoContacto)) { Swal.fire('Formato Inválido', `El teléfono del contacto #${i + 1} no es válido`, 'warning'); return false; }
            if (c.emailContacto && !regexEmail.test(c.emailContacto)) { Swal.fire('Formato Inválido', `El correo del contacto #${i + 1} no es válido`, 'warning'); return false; }
        }
        return true;
    };

    const guardarCambios = async () => {
        // ✅ NUEVO: EJECUTAR VALIDACIÓN ANTES DE ENVIAR
        if (!validarFormulario()) return; 

        try {
            if (form.clienteId === 0) { await axios.post(URL_API, form); Swal.fire('Creado', '', 'success'); }
            else { await axios.put(`${URL_API}/${form.clienteId}`, form); Swal.fire('Actualizado', '', 'success'); }
            setShowModal(false); getClientes();
        } catch (error) { Swal.fire('Error', 'Problema al guardar', 'error'); }
    };

    const eliminarCliente = (id, n) => {
        Swal.fire({ title: `¿Borrar a ${n}?`, showCancelButton: true, confirmButtonText: 'Sí' }).then(async (r) => {
            if (r.isConfirmed) { try { await axios.delete(`${URL_API}/${id}`); Swal.fire('Borrado', '', 'success'); getClientes(); } catch { Swal.fire('Error', '', 'error'); } }
        });
    };

    const verContactos = (c) => { setClienteSeleccionado(c); setListaContactos(c.contactos || []); setShowModalContactos(true); };

    // ==========================================
    // RENDERIZADO (UI CON TABS)
    // ==========================================
    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🚀 Sistema Corporativo Tak</h2>
                
                {/* PANEL DE USUARIO / TOKEN */}
                <div className="card p-2 bg-light border-secondary">
                    <div className="d-flex align-items-center gap-3">
                        <small className="fw-bold text-muted">ESTADO DE SESIÓN:</small>
                        {token ? (
                            <>
                                <span className="badge bg-success p-2">🔑 Autenticado (Admin)</span>
                                <button className="btn btn-outline-danger btn-sm" onClick={cerrarSesion}>Cerrar Sesión</button>
                            </>
                        ) : (
                            <>
                                <span className="badge bg-secondary p-2">🔒 Invitado</span>
                                <button className="btn btn-warning btn-sm fw-bold" onClick={generarToken}>Simular Login (Obtener JWT)</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* BARRA DE NAVEGACIÓN (TABS) */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${tabActual === 'clientes' ? 'active fw-bold' : ''}`} onClick={() => setTabActual('clientes')}>
                        👥 Gestión de Clientes (Público)
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tabActual === 'reportes' ? 'active fw-bold' : ''}`} onClick={() => setTabActual('reportes')}>
                        📊 Reportes Confidenciales (Privado)
                    </button>
                </li>
            </ul>

            {/* --- VISTA 1: CLIENTES (PÚBLICA) --- */}
            {tabActual === 'clientes' && (
                <div className="animate__animated animate__fadeIn">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text">🔍 ID</span>
                                <input type="number" className="form-control" placeholder="Buscar..." value={busquedaId} onChange={(e) => setBusquedaId(e.target.value)} />
                                <button className="btn btn-primary" onClick={buscarPorId}>Buscar</button>
                                <button className="btn btn-secondary" onClick={() => { setBusquedaId(''); getClientes(); }}>Reset</button>
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <button className="btn btn-success" onClick={() => abrirModal(1)}>➕ Nuevo Cliente</button>
                        </div>
                    </div>

                    <div className="table-responsive shadow-sm rounded">
                        <table className="table table-hover table-bordered">
                            <thead className="table-dark">
                                <tr><th>ID</th><th>Empresa</th><th>NIT/DPI</th><th>Teléfono</th><th>Acciones</th></tr>
                            </thead>
                            <tbody>
                                {clientes.map((cliente) => (
                                    <tr key={cliente.clienteId}>
                                        <td>{cliente.clienteId}</td>
                                        <td><strong>{cliente.nombreCliente}</strong><br/><small className="text-muted">{cliente.correoElectronico}</small></td>
                                        <td>{cliente.identificador}</td>
                                        <td>{cliente.telefonoPrincipal}</td>
                                        <td>
                                            <button className="btn btn-info btn-sm me-2 text-white" onClick={() => verContactos(cliente)}>👥</button>
                                            <button className="btn btn-primary btn-sm me-2" onClick={() => abrirModal(2, cliente)}>✏️</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => eliminarCliente(cliente.clienteId, cliente.nombreCliente)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- VISTA 2: REPORTES (PRIVADA) --- */}
            {tabActual === 'reportes' && (
                <div className="card shadow-lg p-5 text-center border-0 bg-light">
                    {accesoDenegado ? (
                        <div className="text-danger">
                            <h1 style={{ fontSize: '4rem' }}>🔒</h1>
                            <h3>ACCESO DENEGADO</h3>
                            <p className="lead">Esta zona requiere autenticación JWT.</p>
                            <hr />
                            <p>El servidor respondió: <strong>401 Unauthorized</strong></p>
                            <button className="btn btn-warning btn-lg mt-3" onClick={generarToken}>🔑 Iniciar Sesión / Generar Token</button>
                        </div>
                    ) : dataConfidencial ? (
                        <div className="text-start">
                            <div className="alert alert-success d-flex align-items-center">
                                <h4 className="mb-0 me-3">🔓 Acceso Concedido</h4>
                                <small>Datos descifrados correctamente desde el servidor</small>
                            </div>
                            
                            <div className="row mt-4">
                                <div className="col-md-4">
                                    <div className="card text-white bg-primary mb-3">
                                        <div className="card-header">Ingresos Mensuales</div>
                                        <div className="card-body"><h2>Q{dataConfidencial.ingresosMensuales.toLocaleString()}</h2></div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card text-white bg-success mb-3">
                                        <div className="card-header">Nuevos Clientes</div>
                                        <div className="card-body"><h2>+{dataConfidencial.clientesNuevos}</h2></div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card text-white bg-danger mb-3">
                                        <div className="card-header">Tickets Soporte</div>
                                        <div className="card-body"><h2>{dataConfidencial.ticketsPendientes}</h2></div>
                                    </div>
                                </div>
                            </div>
                            <div className="alert alert-warning mt-3"><strong>🕵️ Mensaje Secreto:</strong> {dataConfidencial.mensajeSecreto}</div>
                        </div>
                    ) : (
                        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
                    )}
                </div>
            )}

            {/* --- MODAL FORMULARIO --- */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">{tituloModal}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <h6 className="border-bottom pb-2 mb-3">🏢 Datos de la Empresa</h6>
                                    <div className="row">
                                        <div className="col-md-6 mb-3"><label>Nombre Empresa *</label><input type="text" className="form-control" name="nombreCliente" value={form.nombreCliente} onChange={handleChange} /></div>
                                        <div className="col-md-6 mb-3"><label>NIT / DPI *</label><input type="text" className="form-control" name="identificador" value={form.identificador} onChange={handleChange} /></div>
                                        <div className="col-md-6 mb-3"><label>Teléfono (8 dígitos) *</label><input type="text" className="form-control" name="telefonoPrincipal" value={form.telefonoPrincipal} onChange={handleChange} placeholder="Ej. 5555-5555" /></div>
                                        <div className="col-md-6 mb-3"><label>País</label><input type="text" className="form-control" name="pais" value={form.pais} onChange={handleChange} /></div>
                                        <div className="col-md-6 mb-3"><label>Dirección</label><input type="text" className="form-control" name="direccion" value={form.direccion} onChange={handleChange} /></div>
                                        <div className="col-md-6 mb-3"><label>Email Corporativo *</label><input type="email" className="form-control" name="correoElectronico" value={form.correoElectronico} onChange={handleChange} placeholder="correo@empresa.com" /></div>
                                    </div>

                                    <h6 className="border-bottom pb-2 mb-3 mt-4 d-flex justify-content-between">
                                        <span>👥 Contactos Asociados</span>
                                        <button type="button" className="btn btn-sm btn-success" onClick={agregarFilaContacto}>+ Agregar Contacto</button>
                                    </h6>
                                    
                                    {form.contactos.map((contacto, index) => (
                                        <div key={index} className="row mb-2 bg-light p-2 rounded border align-items-end">
                                            <div className="col-md-3"><small>Nombre *</small><input type="text" className="form-control form-control-sm" name="nombreContacto" value={contacto.nombreContacto} onChange={(e) => handleContactoChange(index, e)} /></div>
                                            <div className="col-md-3"><small>Puesto</small><input type="text" className="form-control form-control-sm" name="puesto" value={contacto.puesto} onChange={(e) => handleContactoChange(index, e)} /></div>
                                            <div className="col-md-2"><small>Teléfono</small><input type="text" className="form-control form-control-sm" name="telefonoContacto" value={contacto.telefonoContacto} onChange={(e) => handleContactoChange(index, e)} /></div>
                                            <div className="col-md-3"><small>Email</small><input type="text" className="form-control form-control-sm" name="emailContacto" value={contacto.emailContacto} onChange={(e) => handleContactoChange(index, e)} /></div>
                                            <div className="col-md-1 text-end"><button type="button" className="btn btn-danger btn-sm" onClick={() => eliminarFilaContacto(index)}>X</button></div>
                                        </div>
                                    ))}
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="button" className="btn btn-primary" onClick={guardarCambios}>Guardar Todo</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL SOLO LECTURA --- */}
            {showModalContactos && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-info text-white">
                                <h5 className="modal-title">Vista Rápida Contactos</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModalContactos(false)}></button>
                            </div>
                            <div className="modal-body">
                                <table className="table table-bordered">
                                    <thead><tr><th>Nombre</th><th>Puesto</th><th>Teléfono</th><th>Email</th></tr></thead>
                                    <tbody>
                                        {listaContactos.map((c, i) => (
                                            <tr key={i}><td>{c.nombreContacto}</td><td>{c.puesto}</td><td>{c.telefonoContacto}</td><td>{c.emailContacto}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModalContactos(false)}>Cerrar</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TablaClientes;