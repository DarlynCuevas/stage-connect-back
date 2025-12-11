#!/bin/bash

# Ejemplos de cURL para probar los endpoints del RequestsModule
# Reemplaza TOKEN con un JWT válido de un usuario logueado

TOKEN="tu_jwt_token_aqui"
BASE_URL="http://localhost:3000"

# ============================================================================
# 1. CREAR SOLICITUD (Local/Promotor)
# ============================================================================
echo "=== 1. Crear una solicitud ==="
curl -X POST "$BASE_URL/requests" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artistId": 1,
    "requesterId": 2,
    "eventDate": "2025-02-14",
    "eventLocation": "Club Nocturno, Barcelona",
    "eventType": "Club Night",
    "offeredPrice": 2800,
    "message": "Nos encantaría contar contigo para nuestra noche especial de San Valentín."
  }'

echo -e "\n\n"

# ============================================================================
# 2. OBTENER TODAS LAS SOLICITUDES DEL ARTISTA
# ============================================================================
echo "=== 2. Obtener solicitudes recibidas (Artista) ==="
curl -X GET "$BASE_URL/requests" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# ============================================================================
# 3. OBTENER SOLICITUDES ENVIADAS
# ============================================================================
echo "=== 3. Obtener solicitudes enviadas (Local/Promotor) ==="
curl -X GET "$BASE_URL/requests/sent" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# ============================================================================
# 4. OBTENER UNA SOLICITUD ESPECÍFICA
# ============================================================================
echo "=== 4. Obtener solicitud por ID ==="
curl -X GET "$BASE_URL/requests/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# ============================================================================
# 5. ACEPTAR UNA SOLICITUD (Artista)
# ============================================================================
echo "=== 5. Aceptar solicitud ==="
curl -X PATCH "$BASE_URL/requests/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Accepted"
  }'

echo -e "\n\n"

# ============================================================================
# 6. RECHAZAR UNA SOLICITUD (Artista)
# ============================================================================
echo "=== 6. Rechazar solicitud ==="
curl -X PATCH "$BASE_URL/requests/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Rejected"
  }'

echo -e "\n\n"

# ============================================================================
# EJEMPLOS DE ERRORES
# ============================================================================

echo "=== EJEMPLOS DE ERRORES ==="

# Error: Usuario no es el artista dueño
echo -e "\n--- Error 403: Permisos insuficientes ---"
curl -X PATCH "$BASE_URL/requests/1/status" \
  -H "Authorization: Bearer $TOKEN_OTRO_USUARIO" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Accepted"
  }'

# Error: Solicitud no encontrada
echo -e "\n--- Error 404: Solicitud no existe ---"
curl -X GET "$BASE_URL/requests/99999" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Error: Estado ya cambió
echo -e "\n--- Error 400: Solicitud no está pendiente ---"
curl -X PATCH "$BASE_URL/requests/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Accepted"
  }'
# (segunda vez, ya fue aceptada)

# Error: Status inválido
echo -e "\n--- Error 400: Status inválido ---"
curl -X PATCH "$BASE_URL/requests/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Invalid"
  }'

# Error: Sin token JWT
echo -e "\n--- Error 401: Sin autenticación ---"
curl -X GET "$BASE_URL/requests"

echo -e "\n\n"
