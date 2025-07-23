'use client'

import { EventResponse } from '@/lib/server/eventService'
import { Runner } from '@/lib/schemas/racecheck.schema'
import React, { useRef } from 'react'
import html2canvas from 'html2canvas'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, DownloadIcon, MapPinIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const RunnerTicket = ({ runner, event }: { runner: Runner, event: EventResponse }) => {
    const { name, sex, category, time, position, positionSex, positionCategory, dorsal } = runner;
    const router = useRouter()
    const ticketRef = useRef<HTMLDivElement>(null);
    const eventMonth = event?.date
        ? new Date(event?.date).toLocaleString('es-ES', { month: 'long' })
        : 'Mes'
    const eventDay = event?.date
        ? event?.date.split('T')[0].split('-')[2]
        : 'Día'

    const downloadImage = async () => {
        if (!ticketRef.current) return;

        try {
            const canvas = await html2canvas(ticketRef.current, {
                useCORS: true,
                allowTaint: true,
                background: '#ffffff',
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `ticket-${name}-${event.name}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        } catch (error) {
            console.error('Error al generar la imagen:', error);
            alert('Error al generar la imagen. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-950 flex flex-col justify-center items-center h-full py-6">

            <div className="mb-6 text-center flex items-center justify-between gap-2">
                <button
                    type='button'
                    className='rounded-full flex items-center gap-2 bg-white px-6 py-3 border border-gray-200 dark:border-gray-800'
                    onClick={() => router.push('/')}>
                    <ArrowLeftIcon className="w-4 h-4 text-gray-800" />
                    <p className="text-sm font-medium tracking-tight text-gray-800">
                        Volver
                    </p>
                </button>
                <button
                    onClick={downloadImage}
                    className="rounded-full flex items-center gap-2 bg-white px-6 py-3 border border-gray-200 dark:border-gray-800"
                >
                    <p className="text-sm font-medium tracking-tight text-gray-800">
                        Descargar
                    </p>
                    <DownloadIcon className="w-4 h-4 text-gray-800" />
                </button>
            </div>

            <div className="w-[90%] max-w-[370px] border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden rounded-3xl">
                <div className="relative mx-auto h-full max-h-max max-w-[370px] shadow-xl bg-white" ref={ticketRef}>
                    <div className="flex flex-col">
                        <div className="px-8 pt-4 pb-8 border-b-2 border-dashed border-gray-200">
                            <div className="flex flex-col gap-2 mb-6">
                                <p className="text-gray-800 text-3xl font-black tracking-tight font-mono italic">
                                    {name}
                                </p>
                            </div>
                            <div className="flex flex-col items-start max-w-max mx-auto">
                                <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                                    Tiempo
                                </p>
                                <div className=" flex justify-end gap-1">
                                    <p className="font-mono text-[45px] text-gray-700">
                                        {time?.split('.')[0]}
                                    </p>
                                    <p className="text-gray-500 text-xl mt-auto">
                                        ,{time?.split('.')[1]}
                                    </p>
                                </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className='max-w-max flex flex-col'>
                                    <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                        Dorsal
                                    </p>
                                    <h1 className="text-[50px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                        {dorsal}
                                    </h1>
                                </div>
                                <div className='max-w-max flex flex-col'>
                                    <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                        Posición General
                                    </p>
                                    <h1 className="text-[50px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                        {position}
                                    </h1>
                                </div>
                                <div className='max-w-max flex flex-col'>
                                    <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                        Posición {sex}
                                    </p>
                                    <h1 className="text-[50px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                        {positionSex}
                                    </h1>
                                </div>
                                <div className='max-w-max flex flex-col'>
                                    <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                        Posición {category}
                                    </p>
                                    <h1 className="text-[50px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                        {positionCategory}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-2 px-8 pb-8 pt-4">
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-medium tracking-tight text-gray-800">
                                    {event.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-gray-500" />
                                <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                                    {event?.locationName}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                                    {eventDay} de {eventMonth}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-gray-500" />
                                <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                                    {event?.startTime} a {event?.endTime} hs
                                </p>
                            </div>

                            <Image src="/logo-timecontrol.png"
                                alt="Time Control"
                                width={100}
                                height={20}
                                className="p-4"
                                priority
                            />

                        </div>
                    </div>
                </div>
            </div >
        </div>
    )
}

export default RunnerTicket