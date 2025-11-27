import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Search, Plus, Edit2, Trash2, Users, Key, LogOut, Shield, TrendingUp, UserPlus, AlertCircle, Mail, Phone, MapPin, Building } from 'lucide-react';
import takLogo from '@/assets/takglobal_logo.jpg';

interface Contacto {
    nombreContacto: string;
    puesto: string;
    telefonoContacto: string;
    emailContacto: string;
}

interface Cliente {
    clienteId: number;
    nombreCliente: string;
    direccion: string;
    pais: string;
    identificador: string;
    telefonoPrincipal: string;
    correoElectronico: string;
    contactos: Contacto[];
}

interface DataConfidencial {
    ingresosMensuales: number;
    clientesNuevos: number;
    ticketsPendientes: number;
    mensajeSecreto: string;
}

const TablaClientes = () => {
    const [tabActual, setTabActual] = useState('clientes');
    const [token, setToken] = useState('');
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [busquedaId, setBusquedaId] = useState('');
    const [dataConfidencial, setDataConfidencial] = useState<DataConfidencial | null>(null);
    const [accesoDenegado, setAccesoDenegado] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [tituloModal, setTituloModal] = useState('');
    const [showModalContactos, setShowModalContactos] = useState(false);
    const [listaContactos, setListaContactos] = useState<Contacto[]>([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

    const initialState: Cliente = {
        clienteId: 0,
        nombreCliente: '',
        direccion: '',
        pais: '',
        identificador: '',
        telefonoPrincipal: '',
        correoElectronico: '',
        contactos: []
    };
    const [form, setForm] = useState<Cliente>(initialState);

    const URL_API = "https://localhost:7282/api/Clientes";
    const URL_AUTH = "https://localhost:7282/api/Auth";

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexTelefono = /^\d{4}-?\d{4}$/;

    const getClientes = async () => {
        try {
            const response = await axios.get(URL_API);
            setClientes(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const buscarPorId = async () => {
        if (!busquedaId) {
            getClientes();
            return;
        }
        try {
            const response = await axios.get(`${URL_API}/${busquedaId}`);
            setClientes([response.data]);
        } catch (error) {
            toast.warning('Cliente no encontrado', {
                description: 'No existe un cliente con ese ID'
            });
            getClientes();
        }
    };

    const generarToken = async () => {
        try {
            const response = await axios.get(`${URL_AUTH}/GenerarToken`);
            setToken(response.data.token);
            setAccesoDenegado(false);
            toast.success('Autenticación exitosa', {
                description: 'Token JWT generado correctamente'
            });
        } catch (error) {
            toast.error('Error de autenticación', {
                description: 'No se pudo conectar al servidor'
            });
        }
    };

    const cerrarSesion = () => {
        setToken('');
        setDataConfidencial(null);
        setTabActual('clientes');
        toast.info('Sesión cerrada', {
            description: 'Token eliminado correctamente'
        });
    };

    const cargarDatosConfidenciales = async () => {
        if (!token) {
            setAccesoDenegado(true);
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${URL_AUTH}/ResumenConfidencial`, config);
            setDataConfidencial(response.data);
            setAccesoDenegado(false);
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setAccesoDenegado(true);
                setDataConfidencial(null);
            }
        }
    };

    useEffect(() => {
        if (tabActual === 'reportes') cargarDatosConfidenciales();
        else getClientes();
    }, [tabActual]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleContactoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const n = [...form.contactos];
        n[index] = { ...n[index], [name]: value };
        setForm({ ...form, contactos: n });
    };

    const agregarFilaContacto = () =>
        setForm({
            ...form,
            contactos: [...form.contactos, { nombreContacto: '', puesto: '', telefonoContacto: '', emailContacto: '' }]
        });

    const eliminarFilaContacto = (index: number) => {
        const n = form.contactos.filter((_, i) => i !== index);
        setForm({ ...form, contactos: n });
    };

    const abrirModal = (opcion: number, cliente: Cliente | null = null) => {
        if (opcion === 1) {
            setTituloModal('Nuevo Cliente');
            setForm(initialState);
        } else {
            setTituloModal('Editar Cliente');
            setForm({ ...cliente!, contactos: cliente!.contactos || [] });
        }
        setShowModal(true);
    };

    const validarFormulario = () => {
        if (!form.nombreCliente || !form.identificador) {
            toast.warning('Campos obligatorios', {
                description: 'Nombre y NIT son requeridos'
            });
            return false;
        }
        if (!regexTelefono.test(form.telefonoPrincipal)) {
            toast.warning('Formato inválido', {
                description: 'El teléfono debe tener 8 dígitos'
            });
            return false;
        }
        if (!regexEmail.test(form.correoElectronico)) {
            toast.warning('Formato inválido', {
                description: 'El correo electrónico no es válido'
            });
            return false;
        }

        for (let i = 0; i < form.contactos.length; i++) {
            const c = form.contactos[i];
            if (!c.nombreContacto) {
                toast.warning('Contacto incompleto', {
                    description: `El contacto #${i + 1} debe tener nombre`
                });
                return false;
            }
            if (c.telefonoContacto && !regexTelefono.test(c.telefonoContacto)) {
                toast.warning('Formato inválido', {
                    description: `El teléfono del contacto #${i + 1} no es válido`
                });
                return false;
            }
            if (c.emailContacto && !regexEmail.test(c.emailContacto)) {
                toast.warning('Formato inválido', {
                    description: `El correo del contacto #${i + 1} no es válido`
                });
                return false;
            }
        }
        return true;
    };

    const guardarCambios = async () => {
        if (!validarFormulario()) return;

        try {
            if (form.clienteId === 0) {
                await axios.post(URL_API, form);
                toast.success('Cliente creado', {
                    description: 'El cliente se ha registrado exitosamente'
                });
            } else {
                await axios.put(`${URL_API}/${form.clienteId}`, form);
                toast.success('Cliente actualizado', {
                    description: 'Los cambios se han guardado correctamente'
                });
            }
            setShowModal(false);
            getClientes();
        } catch (error) {
            toast.error('Error al guardar', {
                description: 'Hubo un problema al procesar la solicitud'
            });
        }
    };

    const eliminarCliente = async (id: number, nombre: string) => {
        if (window.confirm(`¿Está seguro de eliminar a ${nombre}?`)) {
            try {
                await axios.delete(`${URL_API}/${id}`);
                toast.success('Cliente eliminado', {
                    description: 'El registro ha sido eliminado'
                });
                getClientes();
            } catch (error) {
                toast.error('Error', {
                    description: 'No se pudo eliminar el cliente'
                });
            }
        }
    };

    const verContactos = (c: Cliente) => {
        setClienteSeleccionado(c);
        setListaContactos(c.contactos || []);
        setShowModalContactos(true);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={takLogo} alt="TAK Global" className="h-12 w-12 rounded-lg object-cover" />
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Sistema Corporativo TAK</h1>
                                <p className="text-sm text-muted-foreground">Gestión integral de clientes</p>
                            </div>
                        </div>

                        <Card className="border-primary/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Estado:</span>
                                    </div>
                                    {token ? (
                                        <>
                                            <Badge className="bg-success text-success-foreground animate-pulse-glow">
                                                <Key className="h-3 w-3 mr-1" />
                                                Autenticado
                                            </Badge>
                                            <Button variant="outline" size="sm" onClick={cerrarSesion} className="gap-2">
                                                <LogOut className="h-4 w-4" />
                                                Cerrar Sesión
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Badge variant="secondary">Invitado</Badge>
                                            <Button variant="default" size="sm" onClick={generarToken} className="gap-2">
                                                <Key className="h-4 w-4" />
                                                Iniciar Sesión
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Tabs value={tabActual} onValueChange={setTabActual} className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                        <TabsTrigger value="clientes" className="gap-2">
                            <Users className="h-4 w-4" />
                            Gestión de Clientes
                        </TabsTrigger>
                        <TabsTrigger value="reportes" className="gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Reportes Confidenciales
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: Clientes */}
                    <TabsContent value="clientes" className="animate-fade-in">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Base de Datos de Clientes
                                </CardTitle>
                                <CardDescription>
                                    Administre la información de sus clientes corporativos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="flex-1 flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="Buscar por ID..."
                                                value={busquedaId}
                                                onChange={(e) => setBusquedaId(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Button onClick={buscarPorId} variant="secondary">
                                            Buscar
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setBusquedaId('');
                                                getClientes();
                                            }}
                                            variant="outline"
                                        >
                                            Limpiar
                                        </Button>
                                    </div>
                                    <Button onClick={() => abrirModal(1)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Nuevo Cliente
                                    </Button>
                                </div>

                                <div className="rounded-lg border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-primary text-primary-foreground">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Empresa</th>
                                                    <th className="px-4 py-3 text-left font-semibold">NIT/DPI</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Contacto</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {clientes.map((cliente) => (
                                                    <tr key={cliente.clienteId} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <Badge variant="outline">{cliente.clienteId}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-foreground">{cliente.nombreCliente}</div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {cliente.correoElectronico}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                                {cliente.identificador}
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Phone className="h-3 w-3" />
                                                                {cliente.telefonoPrincipal}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() => verContactos(cliente)}
                                                                >
                                                                    <Users className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => abrirModal(2, cliente)}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => eliminarCliente(cliente.clienteId, cliente.nombreCliente)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB: Reportes */}
                    <TabsContent value="reportes" className="animate-fade-in">
                        <Card className="shadow-lg">
                            <CardContent className="p-8">
                                {accesoDenegado ? (
                                    <div className="text-center py-12">
                                        <div className="flex justify-center mb-6">
                                            <div className="rounded-full bg-destructive/10 p-6">
                                                <Shield className="h-16 w-16 text-destructive" />
                                            </div>
                                        </div>
                                        <h2 className="text-3xl font-bold text-foreground mb-4">Acceso Denegado</h2>
                                        <p className="text-lg text-muted-foreground mb-2">
                                            Esta sección requiere autenticación JWT
                                        </p>
                                        <div className="inline-block bg-destructive/10 text-destructive px-4 py-2 rounded-lg font-mono text-sm mb-8">
                                            Error 401: Unauthorized
                                        </div>
                                        <div>
                                            <Button size="lg" onClick={generarToken} className="gap-2">
                                                <Key className="h-5 w-5" />
                                                Generar Token JWT
                                            </Button>
                                        </div>
                                    </div>
                                ) : dataConfidencial ? (
                                    <div>
                                        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-8 flex items-center gap-3">
                                            <Shield className="h-6 w-6 text-success" />
                                            <div>
                                                <h3 className="font-semibold text-success">Acceso Autorizado</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Datos confidenciales descifrados correctamente
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                                            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4 text-primary" />
                                                        Ingresos Mensuales
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-3xl font-bold text-primary">
                                                        Q {dataConfidencial.ingresosMensuales.toLocaleString()}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        +12% vs mes anterior
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-success/30 bg-gradient-to-br from-success/5 to-success/10">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                        <UserPlus className="h-4 w-4 text-success" />
                                                        Nuevos Clientes
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-3xl font-bold text-success">
                                                        +{dataConfidencial.clientesNuevos}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-warning/30 bg-gradient-to-br from-warning/5 to-warning/10">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4 text-warning" />
                                                        Tickets Pendientes
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-3xl font-bold text-warning">
                                                        {dataConfidencial.ticketsPendientes}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <Card className="bg-accent/30 border-accent">
                                            <CardHeader>
                                                <CardTitle className="text-sm">🔐 Mensaje Confidencial</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-lg font-medium">{dataConfidencial.mensajeSecreto}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                                            <p className="text-muted-foreground">Cargando datos confidenciales...</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Modal Formulario */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{tituloModal}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                                <Building className="h-5 w-5" />
                                Datos de la Empresa
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Nombre Empresa *</label>
                                    <Input name="nombreCliente" value={form.nombreCliente} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">NIT / DPI *</label>
                                    <Input name="identificador" value={form.identificador} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Teléfono (8 dígitos) *</label>
                                    <Input
                                        name="telefonoPrincipal"
                                        value={form.telefonoPrincipal}
                                        onChange={handleChange}
                                        placeholder="5555-5555"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email Corporativo *</label>
                                    <Input
                                        type="email"
                                        name="correoElectronico"
                                        value={form.correoElectronico}
                                        onChange={handleChange}
                                        placeholder="correo@empresa.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">País</label>
                                    <Input name="pais" value={form.pais} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Dirección</label>
                                    <Input name="direccion" value={form.direccion} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Contactos Asociados
                                </h3>
                                <Button size="sm" onClick={agregarFilaContacto} variant="secondary" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Agregar Contacto
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {form.contactos.map((contacto, index) => (
                                    <Card key={index} className="bg-muted/30">
                                        <CardContent className="p-4">
                                            <div className="grid md:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="text-xs font-medium mb-1 block">Nombre *</label>
                                                    <Input
                                                        size={1}
                                                        name="nombreContacto"
                                                        value={contacto.nombreContacto}
                                                        onChange={(e) => handleContactoChange(index, e)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium mb-1 block">Puesto</label>
                                                    <Input
                                                        size={1}
                                                        name="puesto"
                                                        value={contacto.puesto}
                                                        onChange={(e) => handleContactoChange(index, e)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium mb-1 block">Teléfono</label>
                                                    <Input
                                                        size={1}
                                                        name="telefonoContacto"
                                                        value={contacto.telefonoContacto}
                                                        onChange={(e) => handleContactoChange(index, e)}
                                                    />
                                                </div>
                                                <div className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-medium mb-1 block">Email</label>
                                                        <Input
                                                            size={1}
                                                            name="emailContacto"
                                                            value={contacto.emailContacto}
                                                            onChange={(e) => handleContactoChange(index, e)}
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => eliminarFilaContacto(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={guardarCambios}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Contactos (Solo Lectura) */}
            <Dialog open={showModalContactos} onOpenChange={setShowModalContactos}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Contactos de {clienteSeleccionado?.nombreCliente}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold">Puesto</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold">Teléfono</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {listaContactos.map((c, i) => (
                                    <tr key={i} className="hover:bg-muted/50">
                                        <td className="px-4 py-3">{c.nombreContacto}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{c.puesto}</td>
                                        <td className="px-4 py-3">{c.telefonoContacto}</td>
                                        <td className="px-4 py-3 text-sm">{c.emailContacto}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowModalContactos(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TablaClientes;
