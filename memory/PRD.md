# NailCost Pro - PRD

## Credenciales de Prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nailcost.pro | NailCost@Adm1n#2024Secure |
| Comercio | elite.nails@test.com | Test123! |
| Personal | maria.nails@test.com | Test123! |
| Comercio 2 | glamour.spa@test.com | Test123! |

---

## Última Actualización: 09 Marzo 2025

### IMPLEMENTADO EN ESTA SESIÓN

#### 1. Panel Admin: Control de Precios
- Nueva pestaña "Precios" en panel de administración
- Control de precios de suscripción para todos los planes:
  - Personal Básico/Premium
  - Negocio Básico/Premium
- Guardado persistente en MongoDB

#### 2. Panel Admin: Control de Costos Operativos
- Nueva pestaña "Costos" en panel de administración
- Registro de costos de infraestructura (hosting, DB, dominio, APIs)
- Análisis de rentabilidad automático:
  - Total de costos mensuales
  - Ingresos estimados
  - Rentabilidad actual (positiva/negativa)
  - Precio mínimo recomendado por usuario
  - Break-even point (usuarios necesarios)
- Recomendaciones automáticas para ser rentable

#### 3. Dashboard Comercio: Rediseño Completo
- Stats cards modernos: Ingresos, Gastos, Clientes, Inventario
- Barra de progreso de Meta Mensual con porcentaje
- Panel "Top Servicios" rediseñado profesionalmente:
  - Ranking visual (oro, plata, bronce)
  - Barras de progreso por rentabilidad
  - "Ver más" expandible
- Agenda del día con estados de citas
- Tu Equipo con especialidades
- Resumen Rápido (card oscuro)

#### 4. Sistema de Alertas Pop
- Alertas automáticas en esquina inferior derecha
- Tipos: Stock agotado, Stock bajo, Rentabilidad negativa, Meta en riesgo
- Navegación entre alertas
- Descarte individual o masivo
- Persistencia de descartadas (24h)

#### 5. Seed Data: Precios Reales Venezuela
- Base de datos limpiada y repoblada
- 40+ productos con precios reales del mercado venezolano
- 15 estilos de servicios con precios actualizados
- Clientes, empleados, citas, facturas de ejemplo
- Costos operativos de plataforma pre-cargados

#### 6. Tutoriales por Función (Persona/Comercio)
- Componente FeatureTutorial.jsx creado
- 10 tutoriales específicos por función:
  - Productos, Estilos, Clientes, Gastos
  - Calculadora, Inventario, Facturación
  - Simulación, Reportes, Agenda
- Botón "¿Cómo funciona?" en cada página
- Auto-display en primer uso

---

### ESTADO DEL SISTEMA

| Módulo | Estado |
|--------|--------|
| Login/Registro | ✅ Funcionando |
| Dashboard Admin | ✅ Funcionando |
| Dashboard Comercio | ✅ Mejorado |
| Dashboard Persona | ✅ Funcionando |
| Calculadora | ✅ Funcionando |
| Simulador | ✅ Funcionando |
| Inventario | ✅ Corregido |
| Facturación | ✅ Funcionando |
| Reportes | ✅ Funcionando |
| Alertas Pop | ✅ Nuevo |
| Control Precios Admin | ✅ Nuevo |
| Control Costos Admin | ✅ Nuevo |
| Tutoriales | ✅ Nuevo |

---

## PRÓXIMAS TAREAS

### P1 - Alta Prioridad
- [ ] Integrar FeatureTutorial en cada página (agregar botón "?" y auto-display)
- [ ] Panel de "Cuentas por Vencer" para Admin
- [ ] Mejorar exportación Excel con formato profesional

### P2 - Media Prioridad
- [ ] Comparación visual de precios en inventario
- [ ] Impuestos personalizables en facturas
- [ ] Notificaciones por email (SendGrid)

### P3 - Baja Prioridad
- [ ] Integración Stripe para pagos automáticos
- [ ] PWA con funcionalidad offline
- [ ] Modo oscuro completo

---

## PLAN DE LANZAMIENTO

### Pre-Lanzamiento
1. **Testing completo** - Probar todos los flujos con datos reales
2. **Documentación** - Crear guía de usuario
3. **SSL y Dominio** - Configurar dominio de producción
4. **Backups** - Configurar respaldos automáticos

### Costos Estimados de Operación (USD/mes)
| Servicio | Costo Mensual |
|----------|---------------|
| MongoDB Atlas M10 | $57 |
| Servidor (DigitalOcean 4GB) | $24 |
| Cloudflare Pro | $20 |
| SendGrid (50k emails) | $15 |
| Backup Storage | $5 |
| Dominio (.com/año ÷ 12) | $1.50 |
| **TOTAL** | **$122.50** |

### Punto de Equilibrio
- Con precio Personal Básico $5/mes: Necesitas **25 usuarios activos**
- Con precio Business Premium $30/mes: Necesitas **5 usuarios activos**
- **Recomendación**: Enfocarse en usuarios Business para rentabilidad rápida

### Lanzamiento
1. Soft launch con 10-20 usuarios de prueba
2. Recopilar feedback durante 2 semanas
3. Ajustar precios según demanda
4. Marketing en Instagram/TikTok para nail artists
5. Launch público

---

## ARQUITECTURA

```
/app/
├── backend/
│   ├── server.py          # FastAPI + endpoints admin
│   ├── seed_data.py       # Datos de prueba Venezuela
│   └── .env               # Config MongoDB
└── frontend/
    └── src/
        ├── components/
        │   ├── TutorialModal.jsx     # Tutorial general
        │   ├── FeatureTutorial.jsx   # Tutoriales por función
        │   └── AlertPopup.jsx        # Sistema de alertas
        ├── context/
        │   └── AppContext.js         # Estado global
        └── pages/
            ├── AdminPage.jsx         # Panel admin + precios + costos
            └── ComercioDashboard.jsx # Dashboard mejorado
```
