import { SidebarProvider } from '@/components/ui/sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import EventList from '@/components/events/EventList'


export default async function EventPage() {
  //const { data } = await axios.get('/api/events/parse')
  //console.log(data)
  const events = [
    {
      id: 1,
      name: "Charla sobre Inteligencia Artificial",
      date: "2025-06-15",
      time: "18:00",
      location: "Auditorio Central - Universidad X"
    },
    {
      id: 2,
      name: "Taller de Desarrollo Web",
      date: "2025-06-20",
      time: "14:30",
      location: "Laboratorio 3 - Edificio B"
    },
    {
      id: 3,
      name: "Festival de Música Independiente",
      date: "2025-06-22",
      time: "19:00",
      location: "Parque Cultural del Río"
    },
    {
      id: 4,
      name: "Encuentro de Emprendedores",
      date: "2025-06-25",
      time: "10:00",
      location: "Centro de Convenciones San Martín"
    },
    {
      id: 5,
      name: "Conferencia de Ciberseguridad",
      date: "2025-07-01",
      time: "09:00",
      location: "Sala Magna - Facultad de Ingeniería"
    }
  ]


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

                <EventList events={events}/>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
