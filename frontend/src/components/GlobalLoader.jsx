/**
 * FASE 5: Global Loading Component
 * Componente de carga reutilizable con diferentes variantes
 */
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FullPageLoader - Loader de página completa
 */
export function FullPageLoader({ message = "Cargando..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#FDF2F7]">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-[#E84A8A] absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
        </div>
        <p className="text-[#64748B] mt-4">{message}</p>
      </div>
    </div>
  );
}

/**
 * CardLoader - Loader para dentro de cards
 */
export function CardLoader({ height = "200px", message }) {
  return (
    <div 
      className="flex flex-col items-center justify-center bg-stone-50 rounded-xl"
      style={{ minHeight: height }}
    >
      <Loader2 className="w-8 h-8 animate-spin text-stone-400 mb-2" />
      {message && <p className="text-sm text-stone-500">{message}</p>}
    </div>
  );
}

/**
 * InlineLoader - Loader pequeño inline
 */
export function InlineLoader({ size = "sm", className }) {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <Loader2 className={cn("animate-spin text-current", sizes[size], className)} />
  );
}

/**
 * SkeletonLoader - Placeholder animado para contenido
 */
export function SkeletonLoader({ className, variant = "rect" }) {
  const baseClass = "animate-pulse bg-stone-200 rounded";
  
  const variants = {
    rect: "h-4 w-full",
    circle: "h-10 w-10 rounded-full",
    card: "h-24 w-full rounded-xl",
    text: "h-3 w-3/4",
    title: "h-6 w-1/2",
    avatar: "h-12 w-12 rounded-full",
  };

  return <div className={cn(baseClass, variants[variant], className)} />;
}

/**
 * TableSkeleton - Skeleton para tablas
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3 p-4">
      {/* Header */}
      <div className="flex gap-4">
        {Array(cols).fill(0).map((_, i) => (
          <SkeletonLoader key={i} variant="text" className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array(rows).fill(0).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 py-2">
          {Array(cols).fill(0).map((_, colIdx) => (
            <SkeletonLoader key={colIdx} variant="rect" className="flex-1 h-8" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * CardGridSkeleton - Skeleton para grid de cards
 */
export function CardGridSkeleton({ count = 6, cols = 3 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-stone-100 space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonLoader variant="avatar" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader variant="title" />
              <SkeletonLoader variant="text" />
            </div>
          </div>
          <SkeletonLoader variant="rect" className="h-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * ButtonLoader - Button con estado de carga
 */
export function ButtonLoader({ loading, children, loadingText, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <>
          <InlineLoader size="sm" className="mr-2" />
          {loadingText || "Cargando..."}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default {
  FullPageLoader,
  CardLoader,
  InlineLoader,
  SkeletonLoader,
  TableSkeleton,
  CardGridSkeleton,
  ButtonLoader,
};
