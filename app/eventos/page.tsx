import { SidebarProvider } from '@/components/ui/sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import EventList from '@/components/events/EventList'
import { Category, Runner } from '../schemas'
const categories: Category[] = [
  {
    id: 1,
    name: "Juveniles A"
  },
  {
    id: 2,
    name: "Juveniles B"
  },
  {
    id: 3,
    name: "Adultos A"
  },
  {
    id: 4,
    name: "Adultos B"
  },
  {
    id: 5,
    name: "Veteranos A"
  },
  {
    id: 6,
    name: "Veteranos B"
  },
  {
    id: 7,
    name: "Elite"
  }
]

const runners: Runner[] = [
  {
    sex: "M",
    name: "Juan Pérez",
    chip: "A123",
    dorsal: 1,
    modality: "42K",
    category: "Adultos A",
    time: "03:45:30.000",
    position: 1,
    positionSex: 1,
    positionCategory: 1,
    pace: "05:20"
  },
  {
    sex: "F",
    name: "María García",
    chip: "B456",
    dorsal: 2,
    modality: "42K",
    category: "Elite",
    time: "03:50:45.000",
    position: 2,
    positionSex: 1,
    positionCategory: 1,
    pace: "05:28"
  },
  {
    sex: "M",
    name: "Carlos López",
    chip: "C789",
    dorsal: 3,
    modality: "21K",
    category: "Veteranos A",
    time: "01:45:20.000",
    position: 1,
    positionSex: 1,
    positionCategory: 1,
    pace: "05:00"
  }
]

export const events = [
  {
    id: 1,
    name: "Maratón Ciudad de Buenos Aires",
    categories: categories.slice(2, 5),
    participants: runners.slice(0, 2),
    date: "2025-08-15",
    time: "07:00",
    location: "Avenida 9 de Julio, Buenos Aires",
    imageUrl: "https://www.timecontrolonline.com.ar/Archivos/eventos/Campeonato%20Duatlon%20Cordoba.jpeg",
    description: "Participa en la maratón más emblemática de Argentina, recorriendo los puntos más icónicos de la ciudad."
  },
  {
    id: 2,
    name: "Maratón de la Cordillera",
    categories,
    participants: runners,
    date: "2025-09-10",
    time: "06:30",
    location: "San Carlos de Bariloche, Río Negro",
    imageUrl: "https://www.timecontrolonline.com.ar/Archivos/eventos/lista.jpeg",
    description: "Corre entre paisajes montañosos y disfruta de la naturaleza en su máxima expresión."
  },
  {
    id: 3,
    name: "Maratón del Vino",
    categories: categories.slice(3, 5),
    participants: [runners[2]],
    date: "2025-10-05",
    time: "08:00",
    location: "Mendoza, Argentina",
    imageUrl: "https://www.timecontrolonline.com.ar/Archivos/eventos/Gran%20Fondo%20Justiano%20Posse%2024%20Agosto%202025.jpeg",
    description: "Una experiencia única corriendo entre viñedos y bodegas, con degustaciones al final del recorrido."
  },
  {
    id: 4,
    name: "Maratón Costera",
    categories: categories.slice(0, 2),
    participants: [],
    date: "2025-11-20",
    time: "07:00",
    location: "Mar del Plata, Buenos Aires",
    imageUrl: "https://www.timecontrolonline.com.ar/Archivos/eventos/WhatsApp%20Image%202025-05-24%20at%2019.23.57.jpeg",
    description: "Disfruta de la brisa marina mientras corres a lo largo de la costa atlántica."
  },
  {
    id: 5,
    name: "Maratón Nocturna",
    categories: categories.slice(6),
    participants: [],
    date: "2025-12-15",
    time: "20:00",
    location: "Rosario, Santa Fe",
    imageUrl: "https://www.timecontrolonline.com.ar/Archivos/eventos/Ocr.jpeg",
    description: "Vive la emoción de correr bajo las estrellas en un evento nocturno único."
  }
]

export default async function EventsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Eventos" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6 flex items-center justify-between">
                <p className="font-semibold leading-none tracking-tight">
                  Visualización de eventos
                </p>
                <Link href='eventos/create'>
                  <Button variant="outline" >
                    <span>
                      <Plus />
                    </span>
                    Crear evento
                  </Button>
                </Link>
              </div>
              <div className='px-4 lg:px-6'>

                <EventList events={events} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
