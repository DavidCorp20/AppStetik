import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, X, Calendar, Package, Target, Sparkles, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Check if notifications are supported
const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Notification templates for each user type
const getNotificationStyle = (userType) => {
  if (userType === 'business') {
    return {
      theme: 'comercio',
      colors: {
        bg: 'bg-slate-800',
        accent: 'text-blue-400',
        icon: 'bg-blue-500/20',
      }
    };
  }
  return {
    theme: 'persona',
    colors: {
      bg: 'bg-gradient-to-r from-pink-500 to-rose-500',
      accent: 'text-pink-100',
      icon: 'bg-white/20',
    }
  };
};

// Sample notifications for each user type
const getScheduledNotifications = (userType, userData) => {
  if (userType === 'business') {
    return [
      {
        id: 'citas-hoy',
        title: 'Agenda del Día',
        body: `Tienes ${userData?.citasPendientes || 0} citas programadas para hoy`,
        icon: Calendar,
        time: '08:00',
        type: 'daily'
      },
      {
        id: 'stock-bajo',
        title: 'Alerta de Inventario',
        body: 'Hay productos con stock bajo. Revisa tu inventario.',
        icon: Package,
        time: '10:00',
        type: 'condition',
        condition: 'lowStock'
      },
      {
        id: 'resumen-semanal',
        title: 'Resumen Semanal',
        body: 'Tu reporte de la semana está listo. Revisa tus métricas.',
        icon: DollarSign,
        time: '18:00',
        day: 'friday',
        type: 'weekly'
      }
    ];
  }
  
  // Persona notifications (friendly, motivational)
  return [
    {
      id: 'cita-pronto',
      title: '¡Cita en camino! 💅',
      body: 'Tienes una cita programada pronto. ¡Prepárate para brillar!',
      icon: Calendar,
      time: '1h-before',
      type: 'appointment'
    },
    {
      id: 'meta-progreso',
      title: '¡Sigue así! 🌟',
      body: `Ya llevas el ${userData?.metaProgreso || 0}% de tu meta mensual`,
      icon: Target,
      time: '12:00',
      type: 'daily'
    },
    {
      id: 'tip-dia',
      title: 'Tip del día ✨',
      body: 'Recuerda actualizar tus precios cada mes para mantener tu rentabilidad',
      icon: Sparkles,
      time: '09:00',
      type: 'daily'
    }
  ];
};

export function NotificationManager() {
  const { user, isBusinessUser } = useAuth();
  const [permission, setPermission] = useState('default');
  const [showBanner, setShowBanner] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const style = getNotificationStyle(user?.user_type);

  useEffect(() => {
    if (isNotificationSupported()) {
      setPermission(Notification.permission);
      
      // Show banner if not decided yet and user has been using app for a bit
      if (Notification.permission === 'default') {
        const hasSeenBanner = localStorage.getItem('nailcost_notification_banner_seen');
        if (!hasSeenBanner) {
          setTimeout(() => setShowBanner(true), 5000);
        }
      }

      // Register service worker
      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    if (user && permission === 'granted') {
      // Load scheduled notifications
      const scheduled = getScheduledNotifications(user.user_type, {
        citasPendientes: 3,
        metaProgreso: 65
      });
      setNotifications(scheduled);
    }
  }, [user, permission]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestPermission = async () => {
    if (!isNotificationSupported()) {
      toast.error('Tu navegador no soporta notificaciones');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      localStorage.setItem('nailcost_notification_banner_seen', 'true');
      setShowBanner(false);

      if (result === 'granted') {
        toast.success(
          isBusinessUser 
            ? 'Notificaciones activadas. Recibirás alertas de citas e inventario.' 
            : '¡Genial! Te avisaremos de tus citas y metas 💅'
        );
        
        // Send welcome notification
        sendLocalNotification(
          isBusinessUser 
            ? { title: 'NailCost Business', body: 'Las notificaciones están activas. Recibirás recordatorios importantes.' }
            : { title: '¡Bienvenida! 💕', body: 'Te ayudaremos a no olvidar tus citas y alcanzar tus metas' }
        );
      } else {
        toast.info('Puedes activar las notificaciones más tarde desde configuración');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const sendLocalNotification = useCallback((data) => {
    if (permission !== 'granted') return;

    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: data.tag || 'nailcost-local',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(data.title, options);
      });
    } else {
      new Notification(data.title, options);
    }
  }, [permission]);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('nailcost_notification_banner_seen', 'true');
  };

  // Notification permission banner
  if (showBanner && isNotificationSupported()) {
    return (
      <div className={`fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 rounded-2xl shadow-2xl overflow-hidden animate-slide-up ${
        isBusinessUser ? 'bg-slate-800' : 'bg-gradient-to-r from-pink-500 to-rose-500'
      }`}>
        <div className="p-4">
          <button 
            onClick={dismissBanner}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isBusinessUser ? 'bg-blue-500/20' : 'bg-white/20'
            }`}>
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">
                {isBusinessUser ? '¿Activar notificaciones?' : '¡No te pierdas nada! 💅'}
              </h3>
              <p className="text-sm text-white/80 mt-1">
                {isBusinessUser 
                  ? 'Recibe alertas de citas, inventario bajo y reportes importantes.'
                  : 'Te avisaremos de tus citas y te ayudaremos a alcanzar tus metas del mes.'}
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={requestPermission}
                  size="sm"
                  className={isBusinessUser 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-white text-pink-600 hover:bg-pink-50'}
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Activar
                </Button>
                <Button
                  onClick={dismissBanner}
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  Ahora no
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Hook for sending notifications
export function useNotifications() {
  const { user, isBusinessUser } = useAuth();
  
  const sendNotification = useCallback((type, data = {}) => {
    if (Notification.permission !== 'granted') return;

    const templates = {
      // Persona templates
      'cita-recordatorio': {
        title: '¡Tienes una cita pronto! 💅',
        body: data.clientName ? `Con ${data.clientName} en ${data.time}` : `En ${data.time}`,
        url: '/agenda'
      },
      'meta-alcanzada': {
        title: '¡Felicitaciones! 🎉',
        body: '¡Has alcanzado tu meta del mes! Sigue así.',
        url: '/'
      },
      'nuevo-cliente': {
        title: '¡Nuevo cliente! 💕',
        body: `${data.clientName} se ha agregado a tu lista`,
        url: '/clientes'
      },
      
      // Business templates
      'cita-business': {
        title: 'Recordatorio de Cita',
        body: data.clientName ? `${data.clientName} - ${data.time}` : `Próxima cita en ${data.time}`,
        url: '/agenda'
      },
      'stock-bajo': {
        title: 'Alerta de Stock',
        body: `${data.productName || 'Productos'} con stock bajo`,
        url: '/inventario'
      },
      'factura-pendiente': {
        title: 'Factura Pendiente',
        body: `Tienes ${data.count || 'facturas'} pendientes de cobro`,
        url: '/facturacion'
      },
      'resumen-diario': {
        title: 'Resumen del Día',
        body: `${data.citas || 0} citas completadas | $${data.ingresos || 0} facturado`,
        url: '/'
      }
    };

    const template = templates[type];
    if (!template) return;

    const options = {
      body: template.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: `nailcost-${type}`,
      data: { url: template.url }
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(template.title, options);
      });
    }
  }, [user, isBusinessUser]);

  return { sendNotification };
}

// Notification settings component
export function NotificationSettings() {
  const { isBusinessUser } = useAuth();
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (isNotificationSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const toggleNotifications = async () => {
    if (permission === 'granted') {
      toast.info('Para desactivar notificaciones, hazlo desde la configuración de tu navegador');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      toast.success('Notificaciones activadas');
    }
  };

  if (!isNotificationSupported()) {
    return null;
  }

  return (
    <div className={`p-4 rounded-xl ${isBusinessUser ? 'bg-slate-100' : 'bg-pink-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {permission === 'granted' ? (
            <Bell className={`w-5 h-5 ${isBusinessUser ? 'text-blue-600' : 'text-pink-600'}`} />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className="font-medium">Notificaciones</p>
            <p className="text-sm text-gray-500">
              {permission === 'granted' 
                ? 'Recibes alertas de citas y actualizaciones' 
                : 'Activa para recibir recordatorios'}
            </p>
          </div>
        </div>
        <Button
          onClick={toggleNotifications}
          variant={permission === 'granted' ? 'outline' : 'default'}
          size="sm"
          className={permission !== 'granted' && !isBusinessUser ? 'bg-pink-500 hover:bg-pink-600' : ''}
        >
          {permission === 'granted' ? 'Activadas' : 'Activar'}
        </Button>
      </div>
    </div>
  );
}

export default NotificationManager;
