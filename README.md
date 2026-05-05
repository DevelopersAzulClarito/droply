
# Droply - Travel Hands-Free in Malta 🇲🇹

Droply es la plataforma líder en Malta para el servicio de equipaje. Nuestra misión es permitir que los viajeros exploren la isla sin cargas, ofreciendo recolección, almacenamiento y entrega de equipaje en cualquier punto de Malta.

---

## 🌟 Características Principales

- **Reserva en Línea**: Interfaz fluida para programar puntos de recogida y entrega.
- **Rastreo en Tiempo Real**: Seguimiento detallado del estado del equipaje mediante códigos únicos.
- **Roles de Usuario**:
  - **Clientes**: Gestionan sus reservas y rastrean sus pertenencias.
  - **Keepers (Custodios)**: Panel para gestionar el almacenamiento y entregas asignadas.
  - **Administradores**: Control total sobre la logística, usuarios y finanzas.
- **Pagos Seguros**: Integración con Stripe para transacciones rápidas y seguras.
- **IA Integrada**: Uso de Google Gemini para optimización de procesos y asistencia.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Estilizado**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion (Motion)](https://motion.dev/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Estado y Rutas**: React Context API & React Router 7

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) con Express
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos & Auth**: [Firebase](https://firebase.google.com/)
- **Pagos**: [Stripe API](https://stripe.com/)

---

## 📂 Estructura del Proyecto

El proyecto está organizado como un monorepo simplificado:

```text
droply/
├── frontend/     # Aplicación React (Vite)
├── backend/      # Servidor Express (API & Stripe)
├── firebase/     # Configuraciones y reglas de Firebase
├── docs/         # Documentación técnica adicional
└── .github/      # Workflows de CI/CD (GitHub Actions)
```

---

## 🚀 Configuración y Desarrollo

### Requisitos
- Node.js 18+
- Cuenta de Firebase y Stripe (para desarrollo de API)

### Instalación

1. **Clonar y entrar al directorio:**
   ```bash
   git clone <url-del-repositorio>
   cd droply
   ```

2. **Configurar el Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. **Configurar el Backend:**
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   npm run dev
   ```

---

## 🛡️ CI/CD

El proyecto cuenta con integración continua mediante **GitHub Actions**, lo que garantiza que cada Pull Request sea verificado automáticamente antes de ser integrado a la rama principal.

---

Desarrollado para elevar la experiencia de viaje en el Mediterráneo. 🌊
