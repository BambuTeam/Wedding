# AUREA — Boutique de Invitaciones Digitales Inteligentes & Event-Tech

Plataforma SaaS de hospitalidad digital para bodas de lujo, eventos sociales y wedding planners en Latinoamérica.

Construida con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Amazon DynamoDB (Single-Table Design)** y **Amazon S3**.

---

## 🏛️ Ecosistema de la Plataforma

AUREA cuenta con un **Navegador del Ecosistema Flotante** superior en todas las vistas para alternar instantáneamente entre los módulos y probar perfiles de invitados reales:

1. **Landing Comercial B2C & B2B (`/`):**
   - Hero editorial con iPhone interactivo (tabs: *Sobre*, *RSVP*, *Mesas*, *Pase QR*) y notificaciones push flotantes estilo iOS.
   - Galería interactiva de estilos (Bodas de Destino, XV Años de Gala, Galas Corporativas, Baby Showers).
   - Matriz comparativa: *PDF Tradicional vs. Plataforma AUREA*.
   - Propuesta de valor y copiloto para Wedding Planners y Agencias.

2. **Invitación Personalizada del Invitado (`/invitacion/[token]`):**
   - **Sobre Digital Interactivo:** Textura artesanal, pases reservados y lacre dorado animado con audio ambiental armónico.
   - **Silent Tracking:** Al abrir el lacre, la plataforma actualiza automáticamente el estado del invitado de `UNOPENED` a `OPENED` con timestamp milimétrico.
   - **Contenido Editorial:** Cuenta regresiva viva, historia nupcial, itinerario con botones a **Waze**, **Google Maps** y descarga de **`.ics` (Apple / Google Calendar)**, código de vestimenta con paleta y mesa de regalos con copia rápida.
   - **RSVP + Pase QR:** Confirmación estrictamente acotada a los lugares asignados (`maxSeats`), notas de alergias para cocina, dedicatoria y **Pase QR de alta resolución con 1-clic para respaldo por WhatsApp**.

3. **Dashboard Operativo de Novios & Wedding Planner (`/dashboard`):**
   - **Modo Wedding Planner:** Selector multi-evento (*Camila & Andrés*, *Valentina & Mateo*, *Sofía & Sebastián*).
   - **KPIs en Vivo:** Pases asignados, confirmados, pendientes, tasa real de apertura (`%`), check-in en puerta y resumen de alergias para el chef.
   - **Tabla Maestra de Invitados:** Filtros dinámicos, creación de nuevas familias con generación automática de tokens y generador de invitaciones / recordatorios personalizados de **1-clic directo a WhatsApp**.
   - **Seating Chart:** Asignación visual de familias a mesas (Imperiales y Redondas) con validación de capacidad.
   - **Recepción en Vivo & Escáner QR:** Validación con **control anti-fraude atómico** que bloquea duplicaciones en milisegundos y muestra la hora exacta del primer ingreso.

4. **Kit del Día (`/kit-del-dia`):**
   - Buscador exprés *"Encuentra tu mesa"* por nombre o apellido.
   - Cronograma minuto a minuto con momento actual resaltado (*"AHORA SUCEDIENDO"*).
   - Menú del Banquete Imperial con notas dietéticas.
   - Tarjeta de Wi-Fi con copia de contraseña en 1 toque y QR de conexión automática.
   - **Álbum Colaborativo en Vivo:** Subida instantánea de fotos que se proyectan en tiempo real.

5. **Modo TV (`/modo-tv`):**
   - Vista de pantalla completa para proyectores y pantallas del venue.
   - Carrusel de fotos en vivo subidas por invitados, reloj colonial, ticker de llegadas y QR gigante para que los invitados interactúen desde sus mesas.

---

## ⚡ Arquitectura AWS Zero-Waste ($0/mes en Reposo)

La arquitectura está documentada en detalle en [`/infrastructure/aws-setup.md`](infrastructure/aws-setup.md):

- **Amazon DynamoDB (On-Demand / Pay-Per-Request):**
  - Tabla única: `EventosPlatform` (`PK: String`, `SK: String`).
  - Control anti-fraude atómico mediante `UpdateCommand` con `ConditionExpression: "attribute_not_exists(checkedInAt)"`.
- **Amazon S3 Presigned URLs:**
  - Carga directa desde el navegador del invitado a S3 sin saturar memoria ni CPU en Next.js.
- **Fallback Automático In-Memory:**
  - Si no se configuran variables de AWS en `.env.local`, AUREA se ejecuta en memoria con persistencia en runtime y todas las funcionalidades 100% operativas.

---

## 🚀 Inicio Rápido en Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:3000
```

Para crear la tabla de DynamoDB y el bucket de S3 en AWS CLI en 30 segundos, consulta [`/infrastructure/aws-setup.md`](infrastructure/aws-setup.md).
