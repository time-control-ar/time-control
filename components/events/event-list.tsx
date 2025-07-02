// 'use client'

// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from "@/components/ui/table"
// import { Event } from "@/app/schemas"
// import { useRouter } from "next/navigation"

// type EventListProps = {
//   events: Event[]
// }

// export default function EventList({ events }: EventListProps) {
//   const router = useRouter()

//   return (
//     <Table>
//       <TableCaption>Lista de eventos registrados</TableCaption>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Título</TableHead>
//           <TableHead>Fecha</TableHead>
//           <TableHead>Hora</TableHead>
//           <TableHead>Ubicación</TableHead>
//           <TableHead className="text-right">Acciones</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {events.length === 0 ? (
//           <TableRow>
//             <TableCell colSpan={5} className="text-center">
//               No hay eventos aún.
//             </TableCell>
//           </TableRow>
//         ) : (
//           events.map((event) => (
//             <TableRow key={event.id}>
//               <TableCell>{event.name}</TableCell>
//               <TableCell>{event.date}</TableCell>
//               <TableCell>{event.time}</TableCell>
//               <TableCell>{event.location}</TableCell>
//               <TableCell className="text-right">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => router.push(`/eventos/${event.id}`)}
//                 >
//                   Ver
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))
//         )}
//       </TableBody>
//     </Table>
//   )
// }
