# Pruebas unitarias: Registro e Inicio de Sesión

Este documento describe los casos de prueba unitaria para el servicio de autenticación (`auth.service.ts`) en el backend NestJS. Se cubren los flujos de registro y login, asegurando que la lógica principal funcione correctamente y que los errores sean gestionados de forma profesional.

## 1. Registro de usuario
- **Caso exitoso:**
  - Se registra un usuario con datos válidos (nombre, email, contraseña, rol).
  - Se espera que el usuario se cree y se retorne sin el hash de la contraseña.
- **Email duplicado:**
  - Se intenta registrar un usuario con un email ya existente.
  - Se espera que se lance una excepción de BadRequest.
- **Contraseña inválida:**
  - Se intenta registrar con una contraseña menor a 6 caracteres.
  - Se espera que la validación falle.
- **Rol inválido:**
  - Se intenta registrar con un rol no permitido.
  - Se espera que la validación falle.

## 2. Inicio de sesión
- **Login exitoso:**
  - Se inicia sesión con email y contraseña correctos.
  - Se espera que se retorne el usuario sin el hash y se genere el token JWT.
- **Email no existente:**
  - Se intenta iniciar sesión con un email no registrado.
  - Se espera que se lance una excepción de Unauthorized.
- **Contraseña incorrecta:**
  - Se intenta iniciar sesión con una contraseña incorrecta.
  - Se espera que la función retorne null o lance excepción.

## 3. Validaciones adicionales
- **Formato de email inválido:**
  - Se intenta registrar o iniciar sesión con un email mal formado.
  - Se espera que la validación falle.

---

Cada caso de prueba será implementado en el archivo `auth.service.spec.ts` usando Jest y las utilidades de NestJS. Se simularán los servicios dependientes (UsersService, JwtService) para aislar la lógica de autenticación.

Se irá actualizando este documento conforme se agreguen nuevas pruebas o se modifique la lógica de autenticación.