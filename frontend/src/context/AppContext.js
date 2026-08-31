import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, authAxios } from './AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const asArray = (value) => Array.isArray(value) ? value : [];

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [productos, setProductos] = useState([]);
  const [estilos, setEstilos] = useState([]);
  const [disenos, setDisenos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [configGanancias, setConfigGanancias] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [prodRes, estilosRes, disenosRes, gastosRes, ganRes, clientesRes, citasRes, alertasRes] = await Promise.all([
        authAxios.get(`${API}/productos`),
        authAxios.get(`${API}/estilos`),
        authAxios.get(`${API}/disenos`),
        authAxios.get(`${API}/gastos`),
        authAxios.get(`${API}/ganancias/config`),
        authAxios.get(`${API}/clientes`),
        authAxios.get(`${API}/citas`),
        authAxios.get(`${API}/alertas`),
      ]);
      setProductos(asArray(prodRes.data));
      setEstilos(asArray(estilosRes.data));
      setDisenos(asArray(disenosRes.data));
      setGastos(asArray(gastosRes.data));
      setConfigGanancias(ganRes.data ?? null);
      setClientes(asArray(clientesRes.data));
      setCitas(asArray(citasRes.data));
      setAlertas(asArray(alertasRes.data));
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status !== 401) setError('Error al cargar los datos');
    } finally { setLoading(false); }
  }, [isAuthenticated]);

  const seedData = async () => {
    await authAxios.post(`${API}/seed`);
    await fetchAllData();
  };

  const addProducto = async (producto) => { const res = await authAxios.post(`${API}/productos`, producto); setProductos(prev => [...asArray(prev), res.data]); return res.data; };
  const updateProducto = async (id, producto) => { const res = await authAxios.put(`${API}/productos/${id}`, producto); setProductos(prev => asArray(prev).map(p => p.id === id ? res.data : p)); return res.data; };
  const deleteProducto = async (id) => { await authAxios.delete(`${API}/productos/${id}`); setProductos(prev => asArray(prev).filter(p => p.id !== id)); };
  const refreshProductos = async () => { const res = await authAxios.get(`${API}/productos`); const data = asArray(res.data); setProductos(data); return data; };

  const addEstilo = async (estilo) => { const res = await authAxios.post(`${API}/estilos`, estilo); setEstilos(prev => [...asArray(prev), res.data]); return res.data; };
  const updateEstilo = async (id, estilo) => { const res = await authAxios.put(`${API}/estilos/${id}`, estilo); setEstilos(prev => asArray(prev).map(e => e.id === id ? res.data : e)); return res.data; };
  const deleteEstilo = async (id) => { await authAxios.delete(`${API}/estilos/${id}`); setEstilos(prev => asArray(prev).filter(e => e.id !== id)); };

  const addDiseno = async (diseno) => { const res = await authAxios.post(`${API}/disenos`, diseno); setDisenos(prev => [...asArray(prev), res.data]); return res.data; };
  const updateDiseno = async (id, diseno) => { const res = await authAxios.put(`${API}/disenos/${id}`, diseno); setDisenos(prev => asArray(prev).map(d => d.id === id ? res.data : d)); return res.data; };
  const deleteDiseno = async (id) => { await authAxios.delete(`${API}/disenos/${id}`); setDisenos(prev => asArray(prev).filter(d => d.id !== id)); };

  const updateGastos = async (gastosData) => { const res = await authAxios.put(`${API}/gastos`, gastosData); setGastos(asArray(res.data)); return res.data; };
  const updateConfigGanancias = async (config) => { const res = await authAxios.put(`${API}/ganancias/config`, config); setConfigGanancias(res.data); return res.data; };
  const calcularPrecio = async (estiloId, disenosIds = []) => { const res = await authAxios.post(`${API}/calcular-precio`, { estilo_id: estiloId, disenos_ids: asArray(disenosIds) }); return res.data; };
  const getReporte = async () => { const res = await authAxios.get(`${API}/reporte`); return res.data; };

  const addCliente = async (cliente) => { const res = await authAxios.post(`${API}/clientes`, cliente); setClientes(prev => [...asArray(prev), res.data]); return res.data; };
  const updateCliente = async (id, cliente) => { const res = await authAxios.put(`${API}/clientes/${id}`, cliente); setClientes(prev => asArray(prev).map(c => c.id === id ? res.data : c)); return res.data; };
  const deleteCliente = async (id) => { await authAxios.delete(`${API}/clientes/${id}`); setClientes(prev => asArray(prev).filter(c => c.id !== id)); };

  const addCita = async (cita) => { const res = await authAxios.post(`${API}/citas`, cita); setCitas(prev => [...asArray(prev), res.data]); return res.data; };
  const updateCita = async (id, cita) => { const res = await authAxios.put(`${API}/citas/${id}`, cita); setCitas(prev => asArray(prev).map(c => c.id === id ? res.data : c)); return res.data; };
  const deleteCita = async (id) => { await authAxios.delete(`${API}/citas/${id}`); setCitas(prev => asArray(prev).filter(c => c.id !== id)); };
  const getCitasProximas = async () => { const res = await authAxios.get(`${API}/citas/proximas`); return asArray(res.data); };

  const addServicio = async (servicio) => { const res = await authAxios.post(`${API}/servicios`, servicio); return res.data; };
  const getServicios = async (mes, anio) => { let url = `${API}/servicios`; if (mes && anio) url += `?mes=${mes}&anio=${anio}`; const res = await authAxios.get(url); return asArray(res.data); };
  const getReporteMensual = async (anio, mes) => { const res = await authAxios.get(`${API}/reportes/mensual/${anio}/${mes}`); return res.data; };
  const getComparativa = async () => { const res = await authAxios.get(`${API}/reportes/comparativa`); return res.data; };
  const simularIngresos = async (serviciosPorDia, diasTrabajo) => { const res = await authAxios.post(`${API}/simulacion/mensual?servicios_por_dia=${serviciosPorDia}&dias_trabajo=${diasTrabajo}`); return res.data; };
  const refreshAlertas = async () => { try { const res = await authAxios.get(`${API}/alertas`); setAlertas(asArray(res.data)); } catch (err) { console.error('Error fetching alertas:', err); } };

  const clearData = useCallback(() => {
    setProductos([]); setEstilos([]); setDisenos([]); setGastos([]); setConfigGanancias(null); setClientes([]); setCitas([]); setAlertas([]); setError(null);
  }, []);

  useEffect(() => { if (isAuthenticated) fetchAllData(); else clearData(); }, [isAuthenticated, fetchAllData, clearData]);

  const value = { productos, estilos, disenos, gastos, configGanancias, clientes, citas, alertas, loading, error, fetchAllData, seedData, addProducto, updateProducto, deleteProducto, refreshProductos, addEstilo, updateEstilo, deleteEstilo, addDiseno, updateDiseno, deleteDiseno, updateGastos, updateConfigGanancias, calcularPrecio, getReporte, addCliente, updateCliente, deleteCliente, addCita, updateCita, deleteCita, getCitasProximas, addServicio, getServicios, getReporteMensual, getComparativa, simularIngresos, refreshAlertas, clearData };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
