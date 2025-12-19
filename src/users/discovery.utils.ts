// discovery.utils.ts
// Utilidad genérica para discovery de perfiles con bloques populares, destacados y resto, con paginación y orden.

export interface DiscoveryOptions<T> {
  featuredKey?: keyof T; // campo para destacados (ej: 'featured')
  reviewsCountKey?: keyof T; // campo para populares (ej: 'reviewsCount', 'totalReviews')
  createdAtKey?: keyof T; // campo para orden por fecha
  idKey?: keyof T; // campo para orden por id
  page?: number;
  pageSize?: number;
}

export interface DiscoveryResult<T> {
  populares: T[];
  destacados: T[];
  resto: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
  };
}

export function discoveryBlocks<T>(
  items: T[],
  options: DiscoveryOptions<T> = {}
): DiscoveryResult<T> {
  const {
    featuredKey = 'featured',
    reviewsCountKey = 'reviewsCount',
    createdAtKey = 'createdAt',
    idKey = 'user_id',
    page = 1,
    pageSize = 20,
  } = options;

  // 1. Populares: top 5 por reviewsCountKey
  const populares = [...items]
    .sort((a, b) => ((b[reviewsCountKey as keyof T] as any) || 0) - ((a[reviewsCountKey as keyof T] as any) || 0))
    .slice(0, 5);

  // 2. Destacados: featuredKey === true, top 5
  const destacados = items.filter(u => !!u[featuredKey as keyof T]).slice(0, 5);

  // 3. Resto: quitar los anteriores y paginar
  const idsPopulares = new Set(populares.map(u => u[idKey as keyof T]));
  const idsDestacados = new Set(destacados.map(u => u[idKey as keyof T]));
  let resto = items.filter(u => !idsPopulares.has(u[idKey as keyof T]) && !idsDestacados.has(u[idKey as keyof T]));

  // Ordenar resto por createdAt DESC, luego id DESC
  resto = resto.sort((a, b) => {
    const dateA = a[createdAtKey as keyof T] ? new Date(a[createdAtKey as keyof T] as any).getTime() : 0;
    const dateB = b[createdAtKey as keyof T] ? new Date(b[createdAtKey as keyof T] as any).getTime() : 0;
    if (dateA !== dateB) return dateB - dateA;
    return ((b[idKey as keyof T] as any) || 0) - ((a[idKey as keyof T] as any) || 0);
  });

  const total = resto.length;
  // Corrige el número de página si se sale de rango
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  // Si page es inválido, forzar a 1, pero si es válido, usar el recibido
  let currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  if (currentPage > maxPage) currentPage = maxPage;
  const paginated = resto.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    populares,
    destacados,
    resto: paginated,
    pagination: {
      page: currentPage,
      pageSize,
      total,
      hasNextPage: currentPage < maxPage,
    },
  };
}
