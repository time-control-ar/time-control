'use client'

import React, { useRef } from 'react'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, DownloadIcon, MapPinIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import html2canvas from 'html2canvas'
import { TicketResponse } from '@/lib/schemas/racecheck.schema'

const RunnerTicket = ({ runner, event, metrics }: TicketResponse) => {
    const { racecheck, posGeneral, posCat } = runner;
    const router = useRouter()
    const ticketRef = useRef<HTMLDivElement>(null);


    if (!event) {
        return (
            <div className="flex flex-col justify-center items-center h-full py-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Evento no encontrado
                    </h2>
                    <p className="text-gray-500 dark:text-gray-500">
                        No se pudo cargar la información del evento
                    </p>
                </div>
            </div>
        )
    }

    if (!runner) {
        return (
            <div className="bg-white dark:bg-gray-950 flex flex-col justify-center items-center h-full py-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Corredor no encontrado
                    </h2>
                    <p className="text-gray-500 dark:text-gray-500">
                        No se pudo cargar la información del corredor
                    </p>
                </div>
            </div>
        )
    }

    const handleDownload = async () => {
        if (!ticketRef.current) return

        try {
            html2canvas(ticketRef.current, {
                useCORS: true, // Permitir imágenes externas
                allowTaint: true, // Permitir contenido externo
                background: '#ffffff', // Fondo blanco
                logging: false, // Desactivar logs
            }).then(canvas => {
                // Convierte el canvas a una URL de datos con mejor calidad
                const imgData = canvas.toDataURL('image/png', 1.0);

                // Crea un enlace temporal para descargar la imagen
                const link = document.createElement('a');
                link.download = `${racecheck.nombre}-${event?.name}-${racecheck.dorsal}.png`;
                link.href = imgData;
                link.click();
            });
        } catch (error) {
            console.error('Error al descargar el ticket:', error)
        }
    }



    return (
        <div className="flex flex-col justify-center items-center h-full py-6">
            <div className="mb-6 text-center flex items-center gap-3 w-[90%] max-w-[350px] mx-auto">
                <div>
                    <button
                        type="button"
                        className="h-10 rounded-full w-10 flex items-center justify-center relative select-none gap-2 bg-gray-100 dark:bg-gray-800 transition-colors shadow-md"
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>


            </div>

            <div className="flex py-3 w-[90%] max-w-[370px]">
                <button
                    type="button"
                    className="h-10 px-4 rounded-full w-max flex items-center justify-center relative select-none gap-2 bg-gray-100 dark:bg-gray-800 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={handleDownload}
                >
                    <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                        Descargar
                    </p>
                    <DownloadIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
            </div>


            <div className="flex w-[90%] max-w-[370px] mx-auto flex-col bg-slate-50 rounded-xl" id="ticket-container" ref={ticketRef}>

                <div className="px-4 flex flex-col gap-4 p-4 h-full">
                    <div className="flex justify-center relative min-h-8 min-w-20 max-w-20 max-h-8">
                        <Image
                            src="/logo-timecontrol.png"
                            alt="TimeControl Logo"
                            layout='fill'
                            className="max-h-8 max-w-auto"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8 px-3 pt-8">
                        <div className='max-w-max mx-auto'>
                            <div className="flex flex-col items-center">
                                <h1 className="text-[40px] -mt-2 font-black tracking-tight text-gray-700 italic font-mono">
                                    {posCat || 'N/A'} <span className="text-gray-400 text-xl font-mono -ml-3">
                                        / {metrics?.runnersBySameCategory || 'N/A'}
                                    </span>
                                </h1>
                            </div>
                            <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                {runner.category.name}
                            </p>
                        </div>

                        <div className='max-w-max mx-auto mt-auto'>
                            <div className="flex flex-col items-center justify-end">
                                <h1 className="text-[35px] -mt-2 font-extrabold tracking-tight text-gray-700 italic font-mono">
                                    {posGeneral || 'N/A'} <span className="text-gray-400 text-xl font-mono -ml-3">
                                        / {metrics?.runnersBySameModality || 'N/A'}
                                    </span>
                                </h1>
                            </div>
                            <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                General
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-start col-span-2">
                            <p className="text-gray-700 text-2xl font-semibold tracking-tight text-start w-full pb-3">
                                {racecheck.nombre}
                            </p>

                            <div className="flex flex-col items-start justify-end gap-1 w-full">
                                <p className="text-gray-400 text-xs font-normal tracking-tight font-mono">
                                    Modalidad
                                </p>
                                <h1 className="text-4xl font-semibold tracking-tight text-gray-700 italic font-mono pb-3">
                                    {runner.modality.name}
                                </h1>
                            </div>
                            <p className="text-gray-400 text-xs font-normal tracking-tight font-mono">
                                Tiempo
                            </p>

                            <div className="h-max flex items-end justify-start">
                                <p className="font-mono tracking-tight text-[30px] text-gray-700 pb-2">
                                    {racecheck.tiempo?.split('.')[0]}
                                    <span className="text-gray-500 text-base font-mono">
                                        ,{racecheck.tiempo?.split('.')[1]}
                                    </span>
                                </p>
                            </div>
                            <h1 className="text-sm font-normal tracking-tight text-gray-400 italic font-mono pb-3 -mt-3">
                                {racecheck.ritmo || 'N/A'}
                            </h1>
                        </div>
                    </div>

                </div >

                <div className="border-b-2 border-dashed border-gray-200 px-3 pb-6">
                </div>

                <div className="flex flex-col items-start px-8 pb-8 pt-4 relative">
                    <p className="text-gray-700 text-2xl font-semibold tracking-tight text-start w-full">
                        {event?.name}
                    </p>

                    <div className="flex flex-row items-end h-max gap-2 pt-2">
                        <div>
                            <MapPinIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                            {event?.location.name || 'Ubicación no especificada'}
                        </p>
                    </div>
                    <div className="flex flex-row items-end h-max gap-2 pt-2">
                        <div>
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                            {event?.date}
                        </p>
                    </div>
                    <div className="flex flex-row items-end h-max gap-2 pt-2">
                        <div>
                            <ClockIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                            {event?.startTime} a {event?.endTime} hs
                        </p>
                    </div>
                </div>
            </div >


        </div >
    )
}

export default RunnerTicket