# Gestión de Solicitudes de Booking (RequestsModule)

## Resumen de Cambios Implementados

Este documento describe la implementación completa del módulo de solicitudes de booking en el backend NestJS.

---

## 1. Entidad Request (src/requests/request.entity.ts)

### Cambios realizados:

#### Enum RequestStatus
```typescript
export enum RequestStatus {
  PENDIENTE = 'Pending',
  ACEPTADA = 'Accepted',
  RECHAZADA = 'Rejected',
}
```

#### Propiedades de la entidad
- **id**: Primary Generated Column (auto-incremental)
- **artist**: ManyToOne → User (artista que recibe la solicitud)
- **requester**: ManyToOne → User (local/promotor que envía la solicitud)
- **eventDate**: Date (fecha del evento)
- **eventLocation**: String (ubicación del evento)
- **eventType**: String (tipo de evento)
- **offeredPrice**: Decimal (precio ofrecido)
- **message**: Text (detalle de la solicitud, opcional)
- **status**: Enum RequestStatus (PENDIENTE por defecto)
- **createdAt**: Timestamp (automático)
- **updatedAt**: Timestamp (automático)

### Características:
- ✅ Relaciones eager-loaded para optimización
- ✅ Cascade delete en ambas relaciones Foreign Key
- ✅ Campos de auditoría (createdAt, updatedAt)

---

## 2. DTOs (Data Transfer Objects)

### CreateRequestDto (src/requests/dto/create-request.dto.ts)
Permite crear una nueva solicitud con validación:
```typescript
{
  artistId: number,        // ID del artista
  requesterId: number,     // ID del solicitante (local/promotor)
  eventDate: Date,
  eventLocation: string,
  eventType: string,
  offeredPrice: number,
  message?: string
}
```

### UpdateRequestStatusDto (src/requests/dto/update-request-status.dto.ts)
Permite solo cambiar el estado a 'Accepted' o 'Rejected':
```typescript
{
  status: 'Accepted' | 'Rejected'
}
```

---

## 3. RequestsService (src/requests/requests.service.ts)

### Métodos implementados:

#### `create(createRequestDto): Promise<Request>`
Crea una nueva solicitud de booking.
- ✅ Valida que artista y solicitante existan
- ✅ Estado por defecto: PENDIENTE

#### `findByArtistUserId(artistUserId): Promise<Request[]>`
Obtiene todas las solicitudes recibidas por un artista.
- Ordenadas por fecha descendente
- Incluye datos del requester

#### `findBySenderUserId(requesterUserId): Promise<Request[]>`
Obtiene todas las solicitudes enviadas por un local/promotor.

#### `findOne(id): Promise<Request>`
Obtiene una solicitud específica por ID.

#### `updateStatus(requestId, statusDto, currentUserId): Promise<Request>`
Actualiza el estado de una solicitud.
- ✅ Solo el artista puede cambiar el estado
- ✅ Solo se permiten cambios desde estado PENDIENTE
- ✅ Estados permitidos: ACEPTADA, RECHAZADA

---

## 4. RequestsController (src/requests/requests.controller.ts)

### Endpoints implementados:

#### POST /requests
**Roles**: Local, Promotor
Crear una nueva solicitud de booking.

```bash
curl -X POST http://localhost:3000/requests \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artistId": 1,
    "requesterId": 2,
    "eventDate": "2025-02-14",
    "eventLocation": "Club Nocturno, Barcelona",
    "eventType": "Club Night",
    "offeredPrice": 2800,
    "message": "Nos encantaría contar contigo..."
  }'
```

#### GET /requests
**Roles**: Artista
Obtiene todas las solicitudes recibidas por el artista logueado.

```bash
curl -X GET http://localhost:3000/requests \
  -H "Authorization: Bearer TOKEN"
```

#### GET /requests/sent
**Roles**: Local, Promotor
Obtiene todas las solicitudes enviadas por el local/promotor logueado.

```bash
curl -X GET http://localhost:3000/requests/sent \
  -H "Authorization: Bearer TOKEN"
```

#### GET /requests/:id
Obtiene una solicitud específica por ID.

```bash
curl -X GET http://localhost:3000/requests/1 \
  -H "Authorization: Bearer TOKEN"
```

#### PATCH /requests/:id/status
**Roles**: Artista
Actualiza el estado de una solicitud.

```bash
curl -X PATCH http://localhost:3000/requests/1/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "Accepted" }'
```

---

## 5. Base de Datos (Migración)

### Tabla 'requests' se crea con:

```sql
CREATE TYPE request_status_enum AS ENUM ('Pending', 'Accepted', 'Rejected');

CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  artist_id INT NOT NULL,
  requester_id INT NOT NULL,
  eventDate DATE NOT NULL,
  eventLocation VARCHAR(255) NOT NULL,
  eventType VARCHAR(100) NOT NULL,
  offeredPrice NUMERIC(10,2) NOT NULL,
  message TEXT,
  status request_status_enum DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artist_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### Generación de Migración:

Con `synchronize: true` en app.module.ts, la tabla se crea automáticamente.

Para generar archivo de migración manual:
```bash
npm run typeorm migration:generate -- src/migrations/CreateRequestsTable
```

---

## 6. Integración Frontend-Backend

### Estados en el Backend: 'Pending', 'Accepted', 'Rejected'
### Estados en el Frontend: 'Pending', 'Accepted', 'Rejected'

El mapeo es directo sin conversiones necesarias.

### Hook useArtistRequests()
Obtiene las solicitudes reales del backend:
```typescript
const { data: requests = [], isLoading } = useArtistRequests();
```

### Hook useUpdateRequestStatus()
Actualiza el estado de una solicitud:
```typescript
await updateStatusMutation.mutateAsync({ 
  id: requestId, 
  status: 'Accepted' 
});
```

---

## 7. Características de Seguridad

✅ **Autenticación JWT**: Todos los endpoints requieren token válido
✅ **Autorización por roles**: Solo Artistas pueden cambiar estados
✅ **Validación de permisos**: Solo el artista dueño puede cambiar su solicitud
✅ **Validación de estado**: Solo se cambian solicitudes PENDIENTES
✅ **Validación de entidades**: Artista y solicitante deben existir
✅ **Validación con class-validator**: DTOs validan entrada

---

## 8. Flujo Completo de Uso

1. **Local/Promotor envía solicitud**
   ```
   POST /requests → status: 'Pending'
   ```

2. **Artista recibe solicitud**
   ```
   GET /requests → lista de solicitudes pendientes
   ```

3. **Artista acepta/rechaza**
   ```
   PATCH /requests/:id/status → status: 'Accepted' | 'Rejected'
   ```

4. **Historial disponible**
   ```
   GET /requests → incluye solicitudes aceptadas/rechazadas
   ```

---

## 9. Validaciones Implementadas

| Campo | Validación |
|-------|-----------|
| artistId | Debe existir en users |
| requesterId | Debe existir en users |
| eventDate | Requerido, tipo Date |
| eventLocation | Requerido, string |
| eventType | Requerido, string |
| offeredPrice | Requerido, número positivo |
| message | Opcional |
| status | 'Accepted' o 'Rejected' solo |

---

## 10. Próximos Pasos Opcionales

- [ ] Agregar campo `negotiationPrice` para contra-ofertas
- [ ] Implementar historial de cambios
- [ ] Agregar notificaciones por email
- [ ] Agregar soft delete
- [ ] Crear reportes de solicitudes

---

## Notas Importantes

⚠️ **Cambios en tipos frontend**: BookingRequest ahora coincide con Request del backend
⚠️ **Estados en mayúscula**: 'Pending', 'Accepted', 'Rejected' (no minúsculas)
⚠️ **ID numérico**: El frontend convierte string a number para validación ParseIntPipe
