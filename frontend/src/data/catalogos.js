// Catálogo completo de productos para estética
// Incluye: Manicure, Pedicure, Pestañas, Cejas, Peluquería

export const CATALOGO_PRODUCTOS = {
  // ==========================================
  // MANICURE Y PEDICURE
  // ==========================================
  manicure_pedicure: {
    nombre: "Manicure y Pedicure",
    icon: "💅",
    productos: [
      // Esmaltes y Geles
      { nombre: "Esmalte Semipermanente", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.5, precio_sugerido: 8.00 },
      { nombre: "Esmalte Gel UV/LED", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.5, precio_sugerido: 7.00 },
      { nombre: "Esmalte Tradicional", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.4, precio_sugerido: 4.00 },
      { nombre: "Base Coat UV/LED", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.3, precio_sugerido: 10.00 },
      { nombre: "Top Coat Brillo", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.3, precio_sugerido: 10.00 },
      { nombre: "Top Coat Matte", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.3, precio_sugerido: 10.00 },
      
      // Acrílicos
      { nombre: "Polvo Acrílico Rosado", tipo: "insumo", unidad: "gramos", uso_por_servicio: 3.0, precio_sugerido: 0.30 },
      { nombre: "Polvo Acrílico Transparente", tipo: "insumo", unidad: "gramos", uso_por_servicio: 3.0, precio_sugerido: 0.28 },
      { nombre: "Polvo Acrílico Blanco", tipo: "insumo", unidad: "gramos", uso_por_servicio: 2.0, precio_sugerido: 0.30 },
      { nombre: "Polvo Cover Pink", tipo: "insumo", unidad: "gramos", uso_por_servicio: 2.5, precio_sugerido: 0.50 },
      { nombre: "Monómero Acrílico", tipo: "insumo", unidad: "ml", uso_por_servicio: 8.0, precio_sugerido: 0.10 },
      
      // Gel y Polygel
      { nombre: "Gel Constructor UV", tipo: "insumo", unidad: "gramos", uso_por_servicio: 3.0, precio_sugerido: 0.70 },
      { nombre: "Polygel", tipo: "insumo", unidad: "gramos", uso_por_servicio: 4.0, precio_sugerido: 0.50 },
      { nombre: "Gel Spider (decoración)", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.2, precio_sugerido: 8.00 },
      
      // Tips y Moldes
      { nombre: "Tips Almendra (caja 500)", tipo: "insumo", unidad: "unidades", uso_por_servicio: 10, precio_sugerido: 0.02 },
      { nombre: "Tips Coffin (caja 500)", tipo: "insumo", unidad: "unidades", uso_por_servicio: 10, precio_sugerido: 0.02 },
      { nombre: "Tips Stiletto (caja 500)", tipo: "insumo", unidad: "unidades", uso_por_servicio: 10, precio_sugerido: 0.02 },
      { nombre: "Moldes Dual System", tipo: "insumo", unidad: "unidades", uso_por_servicio: 10, precio_sugerido: 0.12 },
      { nombre: "Formas de Papel (rollo)", tipo: "insumo", unidad: "unidades", uso_por_servicio: 10, precio_sugerido: 0.01 },
      
      // Decoración
      { nombre: "Piedras Cristal Swarovski", tipo: "insumo", unidad: "unidades", uso_por_servicio: 5, precio_sugerido: 0.02 },
      { nombre: "Piedras Cristal Genéricas", tipo: "insumo", unidad: "unidades", uso_por_servicio: 10, precio_sugerido: 0.005 },
      { nombre: "Foil Dorado/Plata", tipo: "insumo", unidad: "hojas", uso_por_servicio: 1, precio_sugerido: 0.40 },
      { nombre: "Glitter Holográfico", tipo: "insumo", unidad: "gramos", uso_por_servicio: 0.5, precio_sugerido: 0.20 },
      { nombre: "Stickers 3D", tipo: "insumo", unidad: "hojas", uso_por_servicio: 1, precio_sugerido: 0.30 },
      { nombre: "Cinta Striping", tipo: "insumo", unidad: "rollos", uso_por_servicio: 0.2, precio_sugerido: 0.25 },
      { nombre: "Encapsulados Flores Secas", tipo: "insumo", unidad: "paquetes", uso_por_servicio: 0.3, precio_sugerido: 3.00 },
      { nombre: "Confeti Holográfico", tipo: "insumo", unidad: "gramos", uso_por_servicio: 0.3, precio_sugerido: 0.15 },
      
      // Preparación y Limpieza
      { nombre: "Acetona Pura", tipo: "insumo", unidad: "ml", uso_por_servicio: 20, precio_sugerido: 0.005 },
      { nombre: "Alcohol Isopropílico", tipo: "insumo", unidad: "ml", uso_por_servicio: 15, precio_sugerido: 0.004 },
      { nombre: "Primer Sin Ácido", tipo: "insumo", unidad: "ml", uso_por_servicio: 0.5, precio_sugerido: 0.50 },
      { nombre: "Deshidratador", tipo: "insumo", unidad: "ml", uso_por_servicio: 0.5, precio_sugerido: 0.40 },
      { nombre: "Removedor Semipermanente", tipo: "insumo", unidad: "ml", uso_por_servicio: 25, precio_sugerido: 0.014 },
      { nombre: "Algodón", tipo: "insumo", unidad: "gramos", uso_por_servicio: 5, precio_sugerido: 0.006 },
      { nombre: "Toallas Desechables", tipo: "insumo", unidad: "unidades", uso_por_servicio: 2, precio_sugerido: 0.04 },
      
      // Cuidado
      { nombre: "Aceite Cutícula", tipo: "insumo", unidad: "ml", uso_por_servicio: 1, precio_sugerido: 0.25 },
      { nombre: "Crema Hidratante Manos", tipo: "insumo", unidad: "ml", uso_por_servicio: 3, precio_sugerido: 0.02 },
      { nombre: "Exfoliante Manos", tipo: "insumo", unidad: "gramos", uso_por_servicio: 10, precio_sugerido: 0.03 },
      { nombre: "Parafina", tipo: "insumo", unidad: "gramos", uso_por_servicio: 50, precio_sugerido: 0.01 },
      
      // Herramientas
      { nombre: "Lámpara UV/LED 120W", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 45.00 },
      { nombre: "Torno Profesional", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 65.00 },
      { nombre: "Pincel Acrílico Kolinsky", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.01, precio_sugerido: 18.00 },
      { nombre: "Set Pinceles Nail Art", tipo: "herramienta", unidad: "sets", uso_por_servicio: 0.005, precio_sugerido: 12.00 },
      { nombre: "Lima 100/180", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.3, precio_sugerido: 0.40 },
      { nombre: "Lima Banana", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.3, precio_sugerido: 0.50 },
      { nombre: "Buffer Pulidor", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.2, precio_sugerido: 0.15 },
      { nombre: "Cortauñas Profesional", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.005, precio_sugerido: 8.00 },
      { nombre: "Alicate Cutícula", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.005, precio_sugerido: 15.00 },
      { nombre: "Empujador Cutícula", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.01, precio_sugerido: 3.00 },
      { nombre: "Fresas Torno (set)", tipo: "herramienta", unidad: "sets", uso_por_servicio: 0.01, precio_sugerido: 15.00 },
      
      // Pedicure Específico
      { nombre: "Separadores de Dedos", tipo: "insumo", unidad: "pares", uso_por_servicio: 1, precio_sugerido: 0.20 },
      { nombre: "Lima Pies Profesional", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.02, precio_sugerido: 5.00 },
      { nombre: "Piedra Pómez", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.1, precio_sugerido: 2.00 },
      { nombre: "Crema Pies", tipo: "insumo", unidad: "ml", uso_por_servicio: 5, precio_sugerido: 0.03 },
      { nombre: "Sales de Baño", tipo: "insumo", unidad: "gramos", uso_por_servicio: 30, precio_sugerido: 0.01 },
    ]
  },
  
  // ==========================================
  // PESTAÑAS
  // ==========================================
  pestanas: {
    nombre: "Pestañas",
    icon: "👁️",
    productos: [
      // Extensiones
      { nombre: "Pestañas Clásicas Mix", tipo: "insumo", unidad: "tiras", uso_por_servicio: 2, precio_sugerido: 1.50 },
      { nombre: "Pestañas Volumen 2D-6D", tipo: "insumo", unidad: "tiras", uso_por_servicio: 3, precio_sugerido: 2.00 },
      { nombre: "Pestañas Mega Volumen", tipo: "insumo", unidad: "tiras", uso_por_servicio: 4, precio_sugerido: 2.50 },
      { nombre: "Pestañas Pelo a Pelo", tipo: "insumo", unidad: "tiras", uso_por_servicio: 2, precio_sugerido: 3.00 },
      { nombre: "Pestañas de Seda", tipo: "insumo", unidad: "tiras", uso_por_servicio: 2, precio_sugerido: 2.00 },
      { nombre: "Pestañas de Visón", tipo: "insumo", unidad: "tiras", uso_por_servicio: 2, precio_sugerido: 4.00 },
      
      // Adhesivos
      { nombre: "Pegamento Pestañas Negro", tipo: "insumo", unidad: "ml", uso_por_servicio: 0.3, precio_sugerido: 2.00 },
      { nombre: "Pegamento Pestañas Transparente", tipo: "insumo", unidad: "ml", uso_por_servicio: 0.3, precio_sugerido: 2.20 },
      { nombre: "Pegamento Sensible", tipo: "insumo", unidad: "ml", uso_por_servicio: 0.3, precio_sugerido: 3.00 },
      { nombre: "Removedor Pestañas Gel", tipo: "insumo", unidad: "ml", uso_por_servicio: 1, precio_sugerido: 0.80 },
      { nombre: "Removedor Pestañas Crema", tipo: "insumo", unidad: "ml", uso_por_servicio: 1, precio_sugerido: 0.60 },
      
      // Preparación
      { nombre: "Primer Pestañas", tipo: "insumo", unidad: "ml", uso_por_servicio: 0.3, precio_sugerido: 1.00 },
      { nombre: "Limpiador Espuma Pestañas", tipo: "insumo", unidad: "ml", uso_por_servicio: 2, precio_sugerido: 0.15 },
      { nombre: "Parches Ojos (pares)", tipo: "insumo", unidad: "pares", uso_por_servicio: 1, precio_sugerido: 0.30 },
      { nombre: "Cinta Micropore", tipo: "insumo", unidad: "cm", uso_por_servicio: 10, precio_sugerido: 0.01 },
      
      // Lifting
      { nombre: "Kit Lifting Pestañas", tipo: "insumo", unidad: "aplicaciones", uso_por_servicio: 1, precio_sugerido: 3.00 },
      { nombre: "Rodillos Lifting (varios tamaños)", tipo: "insumo", unidad: "sets", uso_por_servicio: 0.1, precio_sugerido: 5.00 },
      { nombre: "Tinte Pestañas Negro", tipo: "insumo", unidad: "aplicaciones", uso_por_servicio: 1, precio_sugerido: 1.50 },
      { nombre: "Tinte Pestañas Marrón", tipo: "insumo", unidad: "aplicaciones", uso_por_servicio: 1, precio_sugerido: 1.50 },
      { nombre: "Oxidante Tinte", tipo: "insumo", unidad: "ml", uso_por_servicio: 2, precio_sugerido: 0.10 },
      
      // Herramientas
      { nombre: "Pinzas Rectas Pestañas", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.005, precio_sugerido: 12.00 },
      { nombre: "Pinzas Curvas Pestañas", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.005, precio_sugerido: 12.00 },
      { nombre: "Pinzas Volumen", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.005, precio_sugerido: 15.00 },
      { nombre: "Anillo Porta Pegamento", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.02, precio_sugerido: 2.00 },
      { nombre: "Piedra Jade", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.01, precio_sugerido: 8.00 },
      { nombre: "Lámpara Lupa LED", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 35.00 },
      { nombre: "Ventilador/Secador Pestañas", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 15.00 },
      { nombre: "Cepillos Máscara Desechables", tipo: "insumo", unidad: "unidades", uso_por_servicio: 1, precio_sugerido: 0.05 },
      { nombre: "Aplicadores Microbrush", tipo: "insumo", unidad: "unidades", uso_por_servicio: 2, precio_sugerido: 0.02 },
    ]
  },
  
  // ==========================================
  // CEJAS
  // ==========================================
  cejas: {
    nombre: "Cejas",
    icon: "🤨",
    productos: [
      // Diseño y Depilación
      { nombre: "Cera Cejas Roll-On", tipo: "insumo", unidad: "ml", uso_por_servicio: 5, precio_sugerido: 0.05 },
      { nombre: "Cera Cejas Perlas", tipo: "insumo", unidad: "gramos", uso_por_servicio: 10, precio_sugerido: 0.03 },
      { nombre: "Bandas Depilatorias", tipo: "insumo", unidad: "unidades", uso_por_servicio: 3, precio_sugerido: 0.10 },
      { nombre: "Hilo Depilación", tipo: "insumo", unidad: "metros", uso_por_servicio: 2, precio_sugerido: 0.05 },
      { nombre: "Pinza Cejas Profesional", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.01, precio_sugerido: 8.00 },
      
      // Tinte
      { nombre: "Tinte Cejas Negro", tipo: "insumo", unidad: "aplicaciones", uso_por_servicio: 1, precio_sugerido: 1.00 },
      { nombre: "Tinte Cejas Marrón Oscuro", tipo: "insumo", unidad: "aplicaciones", uso_por_servicio: 1, precio_sugerido: 1.00 },
      { nombre: "Tinte Cejas Marrón Claro", tipo: "insumo", unidad: "aplicaciones", uso_por_servicio: 1, precio_sugerido: 1.00 },
      { nombre: "Oxidante Cejas", tipo: "insumo", unidad: "ml", uso_por_servicio: 3, precio_sugerido: 0.08 },
      
      // Laminado
      { nombre: "Kit Laminado Cejas", tipo: "insumo", unidad: "aplicaciones", uso_por_servicio: 1, precio_sugerido: 3.50 },
      { nombre: "Fijador Cejas", tipo: "insumo", unidad: "ml", uso_por_servicio: 1, precio_sugerido: 0.30 },
      { nombre: "Aceite Nutritivo Cejas", tipo: "insumo", unidad: "ml", uso_por_servicio: 0.5, precio_sugerido: 0.50 },
      
      // Microblading/Micropigmentación
      { nombre: "Agujas Microblading", tipo: "insumo", unidad: "unidades", uso_por_servicio: 1, precio_sugerido: 2.00 },
      { nombre: "Pigmento Microblading", tipo: "insumo", unidad: "ml", uso_por_servicio: 0.2, precio_sugerido: 5.00 },
      { nombre: "Anestésico Tópico", tipo: "insumo", unidad: "gramos", uso_por_servicio: 2, precio_sugerido: 0.80 },
      { nombre: "Lápiz Marcador Cejas", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.1, precio_sugerido: 3.00 },
      
      // Herramientas
      { nombre: "Regla Cejas Dorada", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.01, precio_sugerido: 5.00 },
      { nombre: "Calentador Cera", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 25.00 },
      { nombre: "Tijera Cejas", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.01, precio_sugerido: 6.00 },
      { nombre: "Cepillo Cejas", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.1, precio_sugerido: 1.00 },
    ]
  },
  
  // ==========================================
  // PELUQUERÍA
  // ==========================================
  peluqueria: {
    nombre: "Peluquería",
    icon: "💇",
    productos: [
      // Coloración
      { nombre: "Tinte Permanente (tubo)", tipo: "insumo", unidad: "gramos", uso_por_servicio: 60, precio_sugerido: 0.08 },
      { nombre: "Decolorante Polvo", tipo: "insumo", unidad: "gramos", uso_por_servicio: 30, precio_sugerido: 0.05 },
      { nombre: "Oxidante 10 Vol", tipo: "insumo", unidad: "ml", uso_por_servicio: 60, precio_sugerido: 0.01 },
      { nombre: "Oxidante 20 Vol", tipo: "insumo", unidad: "ml", uso_por_servicio: 60, precio_sugerido: 0.01 },
      { nombre: "Oxidante 30 Vol", tipo: "insumo", unidad: "ml", uso_por_servicio: 60, precio_sugerido: 0.012 },
      { nombre: "Oxidante 40 Vol", tipo: "insumo", unidad: "ml", uso_por_servicio: 60, precio_sugerido: 0.015 },
      { nombre: "Matizador Violeta", tipo: "insumo", unidad: "ml", uso_por_servicio: 30, precio_sugerido: 0.15 },
      { nombre: "Olaplex/Tratamiento Bonding", tipo: "insumo", unidad: "ml", uso_por_servicio: 5, precio_sugerido: 1.00 },
      
      // Tratamientos
      { nombre: "Keratina Brasileña", tipo: "insumo", unidad: "ml", uso_por_servicio: 50, precio_sugerido: 0.40 },
      { nombre: "Botox Capilar", tipo: "insumo", unidad: "ml", uso_por_servicio: 50, precio_sugerido: 0.35 },
      { nombre: "Ampolla Reconstructora", tipo: "insumo", unidad: "unidades", uso_por_servicio: 1, precio_sugerido: 2.00 },
      { nombre: "Mascarilla Hidratante", tipo: "insumo", unidad: "gramos", uso_por_servicio: 30, precio_sugerido: 0.05 },
      { nombre: "Aceite Argán", tipo: "insumo", unidad: "ml", uso_por_servicio: 3, precio_sugerido: 0.20 },
      { nombre: "Protector Térmico", tipo: "insumo", unidad: "ml", uso_por_servicio: 5, precio_sugerido: 0.08 },
      
      // Lavado
      { nombre: "Shampoo Profesional", tipo: "insumo", unidad: "ml", uso_por_servicio: 20, precio_sugerido: 0.02 },
      { nombre: "Acondicionador Profesional", tipo: "insumo", unidad: "ml", uso_por_servicio: 15, precio_sugerido: 0.025 },
      { nombre: "Shampoo Matizador", tipo: "insumo", unidad: "ml", uso_por_servicio: 20, precio_sugerido: 0.04 },
      
      // Styling
      { nombre: "Gel Fijador", tipo: "insumo", unidad: "gramos", uso_por_servicio: 10, precio_sugerido: 0.02 },
      { nombre: "Cera Modeladora", tipo: "insumo", unidad: "gramos", uso_por_servicio: 5, precio_sugerido: 0.05 },
      { nombre: "Spray Fijador", tipo: "insumo", unidad: "ml", uso_por_servicio: 10, precio_sugerido: 0.03 },
      { nombre: "Mousse Volumen", tipo: "insumo", unidad: "ml", uso_por_servicio: 15, precio_sugerido: 0.04 },
      { nombre: "Serum Brillo", tipo: "insumo", unidad: "ml", uso_por_servicio: 2, precio_sugerido: 0.10 },
      
      // Herramientas
      { nombre: "Tijera Corte Profesional", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.002, precio_sugerido: 80.00 },
      { nombre: "Tijera Entresacar", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.002, precio_sugerido: 60.00 },
      { nombre: "Máquina Corte Profesional", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 120.00 },
      { nombre: "Secador Profesional", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 80.00 },
      { nombre: "Plancha Cabello", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 60.00 },
      { nombre: "Rizador/Tenaza", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 50.00 },
      { nombre: "Cepillo Térmico", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.005, precio_sugerido: 15.00 },
      { nombre: "Cepillo Desenredante", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.01, precio_sugerido: 8.00 },
      { nombre: "Peines Set", tipo: "herramienta", unidad: "sets", uso_por_servicio: 0.01, precio_sugerido: 10.00 },
      { nombre: "Brocha Tinte", tipo: "insumo", unidad: "unidades", uso_por_servicio: 0.05, precio_sugerido: 2.00 },
      { nombre: "Bowl Tinte", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.02, precio_sugerido: 3.00 },
      { nombre: "Papel Aluminio (rollo)", tipo: "insumo", unidad: "hojas", uso_por_servicio: 20, precio_sugerido: 0.02 },
      { nombre: "Capa Corte", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.005, precio_sugerido: 15.00 },
      { nombre: "Bata Tinte", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.005, precio_sugerido: 10.00 },
      { nombre: "Guantes (caja)", tipo: "insumo", unidad: "pares", uso_por_servicio: 1, precio_sugerido: 0.10 },
      { nombre: "Gorro Térmico", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.01, precio_sugerido: 8.00 },
      { nombre: "Clips/Pinzas Cabello", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.02, precio_sugerido: 0.50 },
      { nombre: "Rulos Térmicos", tipo: "herramienta", unidad: "sets", uso_por_servicio: 0.02, precio_sugerido: 12.00 },
    ]
  },
  
  // ==========================================
  // GENERAL / VARIOS
  // ==========================================
  general: {
    nombre: "General",
    icon: "🏪",
    productos: [
      { nombre: "Guantes Nitrilo (caja)", tipo: "insumo", unidad: "pares", uso_por_servicio: 1, precio_sugerido: 0.08 },
      { nombre: "Mascarilla Desechable", tipo: "insumo", unidad: "unidades", uso_por_servicio: 1, precio_sugerido: 0.05 },
      { nombre: "Desinfectante Superficies", tipo: "insumo", unidad: "ml", uso_por_servicio: 10, precio_sugerido: 0.01 },
      { nombre: "Esterilizador UV", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.001, precio_sugerido: 40.00 },
      { nombre: "Autoclave", tipo: "herramienta", unidad: "unidades", uso_por_servicio: 0.0005, precio_sugerido: 200.00 },
      { nombre: "Papel Camilla (rollo)", tipo: "insumo", unidad: "metros", uso_por_servicio: 0.5, precio_sugerido: 0.15 },
      { nombre: "Servilletas", tipo: "insumo", unidad: "unidades", uso_por_servicio: 3, precio_sugerido: 0.01 },
    ]
  }
};

// Catálogo de estilos/servicios pre-definidos
export const CATALOGO_ESTILOS = {
  manicure: {
    nombre: "Manicure",
    icon: "💅",
    estilos: [
      { nombre: "Manicure Tradicional", descripcion: "Limado, cutícula y esmaltado tradicional", tiempo_trabajo_minutos: 30, nivel_dificultad: "bajo", precio_sugerido: 8 },
      { nombre: "Manicure Express", descripcion: "Limado rápido y esmaltado", tiempo_trabajo_minutos: 20, nivel_dificultad: "bajo", precio_sugerido: 5 },
      { nombre: "Manicure Rusa", descripcion: "Técnica rusa con torno, cutícula perfecta", tiempo_trabajo_minutos: 45, nivel_dificultad: "medio", precio_sugerido: 12 },
      { nombre: "Manicure Spa", descripcion: "Exfoliación, mascarilla e hidratación", tiempo_trabajo_minutos: 50, nivel_dificultad: "bajo", precio_sugerido: 18 },
      { nombre: "Semipermanente Básico", descripcion: "Esmaltado semipermanente un color", tiempo_trabajo_minutos: 45, nivel_dificultad: "bajo", precio_sugerido: 12 },
      { nombre: "Semipermanente Francés", descripcion: "Diseño francés clásico", tiempo_trabajo_minutos: 55, nivel_dificultad: "medio", precio_sugerido: 15 },
      { nombre: "Semipermanente con Diseño", descripcion: "Semipermanente + nail art sencillo", tiempo_trabajo_minutos: 60, nivel_dificultad: "medio", precio_sugerido: 18 },
      { nombre: "Gel Polish Básico", descripcion: "Esmaltado gel un solo color", tiempo_trabajo_minutos: 50, nivel_dificultad: "bajo", precio_sugerido: 15 },
      { nombre: "Retiro Semipermanente", descripcion: "Remoción completa de semipermanente", tiempo_trabajo_minutos: 20, nivel_dificultad: "bajo", precio_sugerido: 5 },
    ]
  },
  acrilico: {
    nombre: "Uñas Acrílicas",
    icon: "✨",
    estilos: [
      { nombre: "Acrílico Natural", descripcion: "Extensión acrílica look natural", tiempo_trabajo_minutos: 90, nivel_dificultad: "medio", precio_sugerido: 25 },
      { nombre: "Acrílico Francés", descripcion: "Extensión + diseño francés clásico", tiempo_trabajo_minutos: 100, nivel_dificultad: "medio", precio_sugerido: 30 },
      { nombre: "Acrílico Baby Boomer", descripcion: "Degradado rosa-blanco suave", tiempo_trabajo_minutos: 110, nivel_dificultad: "medio", precio_sugerido: 35 },
      { nombre: "Acrílico con Diseño Básico", descripcion: "Extensión + diseño sencillo", tiempo_trabajo_minutos: 120, nivel_dificultad: "medio", precio_sugerido: 35 },
      { nombre: "Acrílico Diseño Elaborado", descripcion: "Acrílico con nail art avanzado", tiempo_trabajo_minutos: 150, nivel_dificultad: "alto", precio_sugerido: 50 },
      { nombre: "Acrílico Encapsulado", descripcion: "Diseño encapsulado con decoraciones", tiempo_trabajo_minutos: 140, nivel_dificultad: "alto", precio_sugerido: 45 },
      { nombre: "Retoque Acrílico", descripcion: "Mantenimiento de extensiones", tiempo_trabajo_minutos: 60, nivel_dificultad: "medio", precio_sugerido: 18 },
      { nombre: "Retiro Acrílico", descripcion: "Remoción completa de acrílico", tiempo_trabajo_minutos: 40, nivel_dificultad: "bajo", precio_sugerido: 10 },
    ]
  },
  gel: {
    nombre: "Gel y Polygel",
    icon: "💎",
    estilos: [
      { nombre: "Gel Esculpido Natural", descripcion: "Uñas esculpidas en gel puro", tiempo_trabajo_minutos: 100, nivel_dificultad: "alto", precio_sugerido: 30 },
      { nombre: "Polygel Natural", descripcion: "Extensión con polygel look natural", tiempo_trabajo_minutos: 80, nivel_dificultad: "medio", precio_sugerido: 22 },
      { nombre: "Polygel con Diseño", descripcion: "Polygel + nail art", tiempo_trabajo_minutos: 100, nivel_dificultad: "medio", precio_sugerido: 30 },
      { nombre: "Rubber Base Natural", descripcion: "Fortalecimiento con base elástica", tiempo_trabajo_minutos: 50, nivel_dificultad: "bajo", precio_sugerido: 15 },
      { nombre: "Overlay Gel", descripcion: "Cobertura de gel sobre uña natural", tiempo_trabajo_minutos: 60, nivel_dificultad: "medio", precio_sugerido: 18 },
      { nombre: "Retoque Gel/Polygel", descripcion: "Mantenimiento mensual", tiempo_trabajo_minutos: 50, nivel_dificultad: "medio", precio_sugerido: 15 },
    ]
  },
  nailart: {
    nombre: "Nail Art",
    icon: "🎨",
    estilos: [
      { nombre: "Diseño Sencillo (por uña)", descripcion: "Diseño básico: líneas, puntos", tiempo_trabajo_minutos: 5, nivel_dificultad: "bajo", precio_sugerido: 1 },
      { nombre: "Diseño Medio (por uña)", descripcion: "Flores, degradados, stamping", tiempo_trabajo_minutos: 10, nivel_dificultad: "medio", precio_sugerido: 2 },
      { nombre: "Diseño Elaborado (por uña)", descripcion: "3D, encapsulado, arte detallado", tiempo_trabajo_minutos: 20, nivel_dificultad: "alto", precio_sugerido: 5 },
      { nombre: "Piedras Swarovski (por uña)", descripcion: "Aplicación de cristales premium", tiempo_trabajo_minutos: 5, nivel_dificultad: "bajo", precio_sugerido: 2 },
      { nombre: "Foil Decorativo", descripcion: "Aplicación de foil en todas las uñas", tiempo_trabajo_minutos: 15, nivel_dificultad: "bajo", precio_sugerido: 5 },
      { nombre: "Efecto Chrome/Espejo", descripcion: "Pigmento espejo en todas las uñas", tiempo_trabajo_minutos: 20, nivel_dificultad: "medio", precio_sugerido: 8 },
    ]
  },
  pedicure: {
    nombre: "Pedicure",
    icon: "🦶",
    estilos: [
      { nombre: "Pedicure Tradicional", descripcion: "Corte, limado y esmaltado", tiempo_trabajo_minutos: 40, nivel_dificultad: "bajo", precio_sugerido: 12 },
      { nombre: "Pedicure Express", descripcion: "Limado rápido y esmaltado", tiempo_trabajo_minutos: 25, nivel_dificultad: "bajo", precio_sugerido: 8 },
      { nombre: "Pedicure Spa", descripcion: "Tratamiento completo con exfoliación", tiempo_trabajo_minutos: 60, nivel_dificultad: "bajo", precio_sugerido: 20 },
      { nombre: "Pedicure Semipermanente", descripcion: "Pedicure + esmaltado semipermanente", tiempo_trabajo_minutos: 50, nivel_dificultad: "bajo", precio_sugerido: 18 },
      { nombre: "Pedicure con Parafina", descripcion: "Tratamiento hidratante con parafina", tiempo_trabajo_minutos: 70, nivel_dificultad: "bajo", precio_sugerido: 25 },
    ]
  },
  pestanas: {
    nombre: "Pestañas",
    icon: "👁️",
    estilos: [
      { nombre: "Extensiones Clásicas", descripcion: "Pelo a pelo look natural", tiempo_trabajo_minutos: 90, nivel_dificultad: "medio", precio_sugerido: 25 },
      { nombre: "Extensiones Volumen 2D-3D", descripcion: "Mayor densidad, look definido", tiempo_trabajo_minutos: 100, nivel_dificultad: "medio", precio_sugerido: 35 },
      { nombre: "Extensiones Volumen 4D-6D", descripcion: "Máximo volumen y drama", tiempo_trabajo_minutos: 120, nivel_dificultad: "alto", precio_sugerido: 45 },
      { nombre: "Mega Volumen", descripcion: "Efecto muy denso y dramático", tiempo_trabajo_minutos: 140, nivel_dificultad: "alto", precio_sugerido: 55 },
      { nombre: "Híbrido Clásico-Volumen", descripcion: "Combinación de técnicas", tiempo_trabajo_minutos: 110, nivel_dificultad: "alto", precio_sugerido: 40 },
      { nombre: "Lifting de Pestañas", descripcion: "Curvado permanente natural", tiempo_trabajo_minutos: 50, nivel_dificultad: "medio", precio_sugerido: 20 },
      { nombre: "Lifting + Tinte", descripcion: "Curvado + coloración", tiempo_trabajo_minutos: 60, nivel_dificultad: "medio", precio_sugerido: 25 },
      { nombre: "Retoque Extensiones", descripcion: "Mantenimiento 2-3 semanas", tiempo_trabajo_minutos: 60, nivel_dificultad: "medio", precio_sugerido: 18 },
      { nombre: "Retiro Extensiones", descripcion: "Remoción completa segura", tiempo_trabajo_minutos: 30, nivel_dificultad: "bajo", precio_sugerido: 8 },
    ]
  },
  cejas: {
    nombre: "Cejas",
    icon: "🤨",
    estilos: [
      { nombre: "Diseño Cejas Cera", descripcion: "Depilación y diseño con cera", tiempo_trabajo_minutos: 20, nivel_dificultad: "bajo", precio_sugerido: 5 },
      { nombre: "Diseño Cejas Hilo", descripcion: "Depilación con técnica de hilo", tiempo_trabajo_minutos: 25, nivel_dificultad: "medio", precio_sugerido: 6 },
      { nombre: "Diseño Cejas Pinza", descripcion: "Perfeccionamiento con pinza", tiempo_trabajo_minutos: 15, nivel_dificultad: "bajo", precio_sugerido: 4 },
      { nombre: "Tinte de Cejas", descripcion: "Coloración temporal cejas", tiempo_trabajo_minutos: 15, nivel_dificultad: "bajo", precio_sugerido: 6 },
      { nombre: "Diseño + Tinte", descripcion: "Depilación completa + tinte", tiempo_trabajo_minutos: 30, nivel_dificultad: "bajo", precio_sugerido: 10 },
      { nombre: "Laminado de Cejas", descripcion: "Tratamiento lifting cejas", tiempo_trabajo_minutos: 45, nivel_dificultad: "medio", precio_sugerido: 18 },
      { nombre: "Laminado + Tinte", descripcion: "Laminado completo con coloración", tiempo_trabajo_minutos: 55, nivel_dificultad: "medio", precio_sugerido: 22 },
      { nombre: "Microblading", descripcion: "Micropigmentación pelo a pelo", tiempo_trabajo_minutos: 120, nivel_dificultad: "alto", precio_sugerido: 80 },
      { nombre: "Microshading", descripcion: "Efecto sombreado polvo", tiempo_trabajo_minutos: 100, nivel_dificultad: "alto", precio_sugerido: 70 },
      { nombre: "Retoque Microblading", descripcion: "Mantenimiento micropigmentación", tiempo_trabajo_minutos: 60, nivel_dificultad: "alto", precio_sugerido: 40 },
    ]
  },
  peluqueria: {
    nombre: "Peluquería",
    icon: "💇",
    estilos: [
      { nombre: "Corte Dama", descripcion: "Corte femenino completo", tiempo_trabajo_minutos: 40, nivel_dificultad: "medio", precio_sugerido: 12 },
      { nombre: "Corte Caballero", descripcion: "Corte masculino clásico", tiempo_trabajo_minutos: 25, nivel_dificultad: "bajo", precio_sugerido: 8 },
      { nombre: "Corte Niño/a", descripcion: "Corte infantil", tiempo_trabajo_minutos: 20, nivel_dificultad: "bajo", precio_sugerido: 6 },
      { nombre: "Lavado + Secado", descripcion: "Shampoo, acondicionador y brushing", tiempo_trabajo_minutos: 30, nivel_dificultad: "bajo", precio_sugerido: 8 },
      { nombre: "Brushing/Peinado", descripcion: "Secado con cepillo", tiempo_trabajo_minutos: 25, nivel_dificultad: "bajo", precio_sugerido: 10 },
      { nombre: "Planchado", descripcion: "Alisado con plancha", tiempo_trabajo_minutos: 30, nivel_dificultad: "bajo", precio_sugerido: 12 },
      { nombre: "Rizos/Ondas", descripcion: "Peinado con tenaza o rizador", tiempo_trabajo_minutos: 40, nivel_dificultad: "medio", precio_sugerido: 15 },
      { nombre: "Tinte Raíz", descripcion: "Retoque de crecimiento", tiempo_trabajo_minutos: 60, nivel_dificultad: "bajo", precio_sugerido: 20 },
      { nombre: "Tinte Completo", descripcion: "Coloración total", tiempo_trabajo_minutos: 90, nivel_dificultad: "medio", precio_sugerido: 35 },
      { nombre: "Mechas/Highlights", descripcion: "Reflejos tradicionales", tiempo_trabajo_minutos: 120, nivel_dificultad: "medio", precio_sugerido: 45 },
      { nombre: "Balayage", descripcion: "Técnica de mano alzada", tiempo_trabajo_minutos: 150, nivel_dificultad: "alto", precio_sugerido: 60 },
      { nombre: "Decoloración", descripcion: "Blanqueado de cabello", tiempo_trabajo_minutos: 90, nivel_dificultad: "medio", precio_sugerido: 40 },
      { nombre: "Matizado", descripcion: "Neutralización de tonos", tiempo_trabajo_minutos: 45, nivel_dificultad: "medio", precio_sugerido: 20 },
      { nombre: "Keratina", descripcion: "Tratamiento alisado brasileño", tiempo_trabajo_minutos: 180, nivel_dificultad: "medio", precio_sugerido: 80 },
      { nombre: "Botox Capilar", descripcion: "Tratamiento reconstructor", tiempo_trabajo_minutos: 90, nivel_dificultad: "bajo", precio_sugerido: 40 },
      { nombre: "Hidratación Profunda", descripcion: "Mascarilla nutritiva", tiempo_trabajo_minutos: 30, nivel_dificultad: "bajo", precio_sugerido: 15 },
      { nombre: "Recogido Sencillo", descripcion: "Peinado evento casual", tiempo_trabajo_minutos: 40, nivel_dificultad: "medio", precio_sugerido: 20 },
      { nombre: "Recogido Elaborado", descripcion: "Peinado evento formal", tiempo_trabajo_minutos: 60, nivel_dificultad: "alto", precio_sugerido: 35 },
      { nombre: "Peinado Novia", descripcion: "Peinado día especial", tiempo_trabajo_minutos: 90, nivel_dificultad: "alto", precio_sugerido: 60 },
    ]
  }
};

export default { CATALOGO_PRODUCTOS, CATALOGO_ESTILOS };
