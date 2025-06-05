'use client'

import { Input } from "@/components/ui/input"
import { useEffect, useState } from 'react'
import { Event, Runner } from '@/app/schemas'
import { TabsContent } from './ui/tabs'
import { Tabs, TabsTrigger } from './ui/tabs'
import { TabsList } from '@radix-ui/react-tabs'
import { RunnersTable } from './runners-table'
import { Button } from './ui/button'
import { File, Trash } from 'lucide-react'
import { Separator } from './ui/separator'
import { textToJsonRaceResults } from '@/lib/utils'

export function CreateEvent() {
    const [eventFile, setEventFile] = useState<File | undefined>(undefined)
    const [event, setEvent] = useState<Event | undefined>(undefined)

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]

        if (file) {
            setEventFile(file)
        } else {
            setEventFile(undefined)
        }
    }
    async function handleParseEvent() {
        const text = await eventFile?.text()
        const parsedEvent = textToJsonRaceResults(text ?? '')

        if (parsedEvent) {
            setEvent(parsedEvent)
        } else {
            setEvent(undefined)
        }
    }

    useEffect(() => {
        if (eventFile) {
            handleParseEvent()
        } else {
            setEvent(undefined)
        }
    }, [eventFile])

    return (
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className="flex flex-col px-6 pb-3 gap-2 w-full">

                <p className="font-semibold leading-none tracking-tight">
                    Subida de resultados
                </p>
                <p className="text-sm text-muted-foreground">
                    Importa un archivo Race Check para visualizar los resultados.
                </p>

                <div className="w-full bg-muted rounded-lg flex gap-2 items-center h-12">
                    {eventFile?.name ? (
                        <div className="flex gap-2 items-center justify-between w-full px-2">
                            <File size={16} />

                            <p className="text-sm font-medium">
                                {eventFile?.name}
                            </p>

                            <Button
                                variant="destructive"
                                className="ml-auto h-7 w-7"
                                onClick={() => setEventFile(undefined)}
                                size="icon"
                            >
                                <Trash />
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

            <Separator />

            <div className="flex flex-col w-full px-6 gap-2">
                <p className="font-semibold leading-none tracking-tight mb-2">
                    Categorías
                </p>

                {event?.categories && event?.categories.length > 0 ? (
                    <Tabs defaultValue="0" className="w-full">
                        <TabsList className="flex flex-wrap gap-2 rounded-lg bg-muted min-h-10 p-2" >
                            {event.categories.map((category, index) => {
                                return <TabsTrigger key={index} value={index.toString()}>{category.name}</TabsTrigger>
                            })}
                        </TabsList>

                        {event?.categories?.map((category, index) => {
                            return (
                                <TabsContent key={index} value={index.toString()}>
                                    <RunnersTable
                                        data={category?.runners?.map((runner: Runner, index: number) => ({
                                            ...runner,
                                            id: index,
                                        }))}
                                    />
                                </TabsContent>
                            )
                        })}
                    </Tabs>
                ) : (
                    <p>No hay categorías</p>
                )}
            </div>

        </div>
    )
}
