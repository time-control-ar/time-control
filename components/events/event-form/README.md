# EventForm - Formulario de Eventos

Este directorio contiene el formulario de eventos modularizado en componentes más pequeños y manejables.

## Estructura de Archivos

### Componente Principal

- `event-form.tsx` - Componente principal que orquesta todos los subcomponentes
- `index.ts` - Archivo de exportación para el componente principal

### Componentes de Información Básica

- `event-form-header.tsx` - Encabezado del formulario con botón de regreso
- `event-form-info.tsx` - Campos de título y cupos máximos
- `event-form-image.tsx` - Subida y gestión de imágenes del evento
- `event-form-datetime.tsx` - Selección de fecha y hora del evento
- `event-form-description.tsx` - Editor de texto enriquecido para la descripción
- `event-form-location.tsx` - Selección de ubicación con mapa
- `event-form-type.tsx` - Selección del tipo de evento

### Componentes de Configuración

- `event-form-config.tsx` - Contenedor principal para modalidades y géneros
- `modality-form.tsx` - Formulario para agregar modalidades
- `category-form.tsx` - Formulario para agregar categorías a modalidades
- `genders-form.tsx` - Formulario para agregar géneros
- `modality-row.tsx` - Fila individual de modalidad en la tabla
- `gender-row.tsx` - Fila individual de género en la tabla

### Componentes de Resultados

- `event-form-results.tsx` - Gestión de archivos de resultados racecheck

## Características

### Modularidad

- Cada sección del formulario está separada en su propio componente
- Fácil mantenimiento y reutilización de componentes
- Separación clara de responsabilidades

### Estilos Consistentes

- Todos los componentes mantienen los estilos originales
- Uso de clases CSS consistentes (`input`, `label-input`, `error-input`, etc.)
- Soporte para modo oscuro/claro

### Funcionalidad Completa

- Validación de formularios con react-hook-form y zod
- Editor de texto enriquecido con TipTap
- Subida de imágenes a Azure
- Gestión de modalidades y categorías
- Procesamiento de archivos racecheck
- Generación de códigos QR

## Uso

```tsx
import EventForm from '@/components/events/event-form'

// Para crear un nuevo evento
<EventForm />

// Para editar un evento existente
<EventForm event={eventData} />
```

## Props del Componente Principal

```tsx
interface EventFormProps {
 event?: EventResponse | null; // Evento existente para edición
}
```

## Dependencias

- `react-hook-form` - Gestión del formulario
- `@hookform/resolvers/zod` - Validación con Zod
- `@tiptap/react` - Editor de texto enriquecido
- `lucide-react` - Iconos
- `next-auth` - Autenticación
- `next/navigation` - Navegación

## Estructura de Datos

El formulario maneja la siguiente estructura de datos:

```tsx
interface EventFormData {
 _id: string;
 name: string;
 image: string;
 date: string;
 startTime: string;
 endTime: string;
 locationName: string;
 location: { lat: number; lng: number };
 description: string;
 maxParticipants: number;
 modalities: Modality[];
 racecheck: string | null;
 type: string;
 genders: Gender[];
}
```
