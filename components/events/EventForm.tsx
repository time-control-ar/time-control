'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, EventFormData } from '@/lib/validations/event-schema'
import { createEvent } from '@/services/eventService'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useState } from 'react'
import { File, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EventForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  })
  const [eventFile, setEventFile] = useState<File | undefined>(undefined)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const router = useRouter()

  const onSubmit = async (data: EventFormData) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('date', data.date)
    formData.append('time', data.time)
    formData.append('location', data.location)

    if (imageFile) {
      formData.append('image', imageFile)
    }

    if (eventFile) {
      formData.append('results', eventFile)
    }

    try {
      const result = await createEvent(formData)
      console.log("Evento creado", result)
      reset()
      setImageFile(undefined)
      setEventFile(undefined)
    } catch (error) {
      console.error(error)
    }

  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEventFile(file)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Título</label>
        <input
          {...register("name")}
          className="w-full border bg-muted text-white p-2 rounded"
          placeholder="Título del evento"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha</label>
        <input type="date" {...register("date")} className="w-full border bg-muted text-white p-2 rounded" />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Hora</label>
        <input type="time" {...register("time")} className="w-full border bg-muted text-white p-2 rounded" />
        {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
      </div>

      <div>
        <label className="block text-sm  font-medium">Ubicación</label>
        <input
          {...register("location")}
          className="w-full border p-2 rounded bg-muted text-white"
          placeholder="Lugar del evento"
        />
        {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Imagen</label>
        <div className="w-full bg-muted rounded-lg flex gap-2 items-center h-12 px-2">
          {imageFile?.name ? (
            <div className="flex gap-2 items-center justify-between w-full">
              <File size={16} />
              <p className="text-sm font-medium truncate">{imageFile.name}</p>
              <Button
                variant="destructive"
                className="ml-auto h-7 w-7"
                onClick={() => setImageFile(undefined)}
                size="icon"
              >
                <Trash size={16} />
              </Button>
            </div>
          ) : (
            <Input
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border-0 shadow-none"
              type="file"
              id="image-upload"
            />
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Resultados</label>
        <div className="w-full bg-muted rounded-lg flex gap-2 items-center h-12 px-2">
          {eventFile?.name ? (
            <div className="flex gap-2 items-center justify-between w-full">
              <File size={16} />
              <p className="text-sm font-medium truncate">{eventFile.name}</p>
              <Button
                variant="destructive"
                className="ml-auto h-7 w-7"
                onClick={() => setEventFile(undefined)}
                size="icon"
              >
                <Trash size={16} />
              </Button>
            </div>
          ) : (
            <Input
              accept=".racecheck"
              onChange={handleFileChange}
              className="w-full border-0 shadow-none"
              id="race-check-file"
              type="file"
            />
          )}
        </div>
      </div>
      
      
      <div className='flex items-center justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          className=" rounded disabled:opacity-50"
          onClick={() => router.push('/eventos')}
        >
          Volver
        </Button>
        <Button
          type="submit"
          variant='outline'
          className=" rounded disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear evento'}
        </Button>
      </div>
    </form>
  )
}
