import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [estilos, setEstilos] = useState([]);
  const [disenos, setDisenos] = useState([]);
  const [gastos, setGastos] = useState(null);
  const [configGanancias, setConfigGanancias] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, estilosRes, disenosRes, gastosRes, ganRes, clientesRes, citasRes, alertasRes] = await Promise.all([
        axios.get(`${API}/productos`),
        axios.get(`${API}/estilos`),
        axios.get(`${API}/disenos`),
        axios.get(`${API}/gastos`),
        axios.get(`${API}/ganancias/config`),
        axios.get(`${API}/clientes`),
        axios.get(`${API}/citas`),
        axios.get(`${API}/alertas`),
      ]);
      
      setProductos(prodRes.data);
      setEstilos(estilosRes.data);
      setDisenos(disenosRes.data);
      setGastos(gastosRes.data);
      setConfigGanancias(ganRes.data);
      setClientes(clientesRes.data);
      setCitas(citasRes.data);
      setAlertas(alertasRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Seed data
  const seedData = async () => {
    try {
      await axios.post(`${API}/seed`);
      await fetchAllData();
    } catch (err) {
      console.error('Error seeding data:', err);
      throw err;
    }
  };

  // CRUD Productos
  const addProducto = async (producto) => {
    const res = await axios.post(`${API}/productos`, producto);
    setProductos(prev => [...prev, res.data]);
    return res.data;
  };

  const updateProducto = async (id, producto) => {
    const res = await axios.put(`${API}/productos/${id}`, producto);
    setProductos(prev => prev.map(p => p.id === id ? res.data : p));
    return res.data;
  };

  const deleteProducto = async (id) => {
    await axios.delete(`${API}/productos/${id}`);
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  // CRUD Estilos
  const addEstilo = async (estilo) => {
    const res = await axios.post(`${API}/estilos`, estilo);
    setEstilos(prev => [...prev, res.data]);
    return res.data;
  };

  const updateEstilo = async (id, estilo) => {
    const res = await axios.put(`${API}/estilos/${id}`, estilo);
    setEstilos(prev => prev.map(e => e.id === id ? res.data : e));
    return res.data;
  };

  const deleteEstilo = async (id) => {
    await axios.delete(`${API}/estilos/${id}`);
    setEstilos(prev => prev.filter(e => e.id !== id));
  };

  // CRUD Diseños
  const addDiseno = async (diseno) => {
    const res = await axios.post(`${API}/disenos`, diseno);
    setDisenos(prev => [...prev, res.data]);
    return res.data;
  };

  const updateDiseno = async (id, diseno) => {
    const res = await axios.put(`${API}/disenos/${id}`, diseno);
    setDisenos(prev => prev.map(d => d.id === id ? res.data : d));
    return res.data;
  };

  const deleteDiseno = async (id) => {
    await axios.delete(`${API}/disenos/${id}`);
    setDisenos(prev => prev.filter(d => d.id !== id));
  };

  // Update Gastos
  const updateGastos = async (gastosData) => {
    const res = await axios.put(`${API}/gastos`, gastosData);
    setGastos(res.data);
    return res.data;
  };

  // Update Config Ganancias
  const updateConfigGanancias = async (config) => {
    const res = await axios.put(`${API}/ganancias/config`, config);
    setConfigGanancias(res.data);
    return res.data;
  };

  // Calcular Precio
  const calcularPrecio = async (estiloId, disenosIds = []) => {
    const res = await axios.post(`${API}/calcular-precio`, {
      estilo_id: estiloId,
      disenos_ids: disenosIds,
    });
    return res.data;
  };

  // Get Reporte
  const getReporte = async () => {
    const res = await axios.get(`${API}/reporte`);
    return res.data;
  };

  // CRUD Clientes
  const addCliente = async (cliente) => {
    const res = await axios.post(`${API}/clientes`, cliente);
    setClientes(prev => [...prev, res.data]);
    return res.data;
  };

  const updateCliente = async (id, cliente) => {
    const res = await axios.put(`${API}/clientes/${id}`, cliente);
    setClientes(prev => prev.map(c => c.id === id ? res.data : c));
    return res.data;
  };

  const deleteCliente = async (id) => {
    await axios.delete(`${API}/clientes/${id}`);
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  // CRUD Citas
  const addCita = async (cita) => {
    const res = await axios.post(`${API}/citas`, cita);
    setCitas(prev => [...prev, res.data]);
    return res.data;
  };

  const updateCita = async (id, cita) => {
    const res = await axios.put(`${API}/citas/${id}`, cita);
    setCitas(prev => prev.map(c => c.id === id ? res.data : c));
    return res.data;
  };

  const deleteCita = async (id) => {
    await axios.delete(`${API}/citas/${id}`);
    setCitas(prev => prev.filter(c => c.id !== id));
  };

  const getCitasProximas = async () => {
    const res = await axios.get(`${API}/citas/proximas`);
    return res.data;
  };

  // Servicios Realizados
  const addServicio = async (servicio) => {
    const res = await axios.post(`${API}/servicios`, servicio);
    return res.data;
  };

  const getServicios = async (mes, anio) => {
    let url = `${API}/servicios`;
    if (mes && anio) {
      url += `?mes=${mes}&anio=${anio}`;
    }
    const res = await axios.get(url);
    return res.data;
  };

  // Reportes
  const getReporteMensual = async (anio, mes) => {
    const res = await axios.get(`${API}/reportes/mensual/${anio}/${mes}`);
    return res.data;
  };

  const getComparativa = async () => {
    const res = await axios.get(`${API}/reportes/comparativa`);
    return res.data;
  };

  // Simulación
  const simularIngresos = async (serviciosPorDia, diasTrabajo) => {
    const res = await axios.post(`${API}/simulacion/mensual?servicios_por_dia=${serviciosPorDia}&dias_trabajo=${diasTrabajo}`);
    return res.data;
  };

  // Refresh alertas
  const refreshAlertas = async () => {
    try {
      const res = await axios.get(`${API}/alertas`);
      setAlertas(res.data);
    } catch (err) {
      console.error('Error fetching alertas:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const value = {
    productos,
    estilos,
    disenos,
    gastos,
    configGanancias,
    clientes,
    citas,
    alertas,
    loading,
    error,
    fetchAllData,
    seedData,
    addProducto,
    updateProducto,
    deleteProducto,
    addEstilo,
    updateEstilo,
    deleteEstilo,
    addDiseno,
    updateDiseno,
    deleteDiseno,
    updateGastos,
    updateConfigGanancias,
    calcularPrecio,
    getReporte,
    addCliente,
    updateCliente,
    deleteCliente,
    addCita,
    updateCita,
    deleteCita,
    getCitasProximas,
    addServicio,
    getServicios,
    getReporteMensual,
    getComparativa,
    simularIngresos,
    refreshAlertas,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
