'use client'

import { EventResponse } from '@/lib/schemas/event.schema'
import { getRacecheckRunners, RacecheckRunner } from '@/lib/utils'

import React, { useRef, useMemo } from 'react'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, DownloadIcon, MapPinIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import html2canvas from 'html2canvas'

const RunnerTicket = ({ runner, event }: { runner: RacecheckRunner, event: EventResponse | undefined }) => {
    const { nombre, sexo, categoria, tiempo, posGeneral, posCat, dorsal, ritmo } = runner;
    const router = useRouter()
    const ticketRef = useRef<HTMLDivElement>(null);

    const eventGenders = event?.genders ?? []
    const eventCategories = event?.modalities?.flatMap((m) => m.categories ?? []) ?? []


    // Memoizar los cálculos para mejorar rendimiento
    const { eventMonth, eventDay, runnersAmount, runnersInThisCategory, runnersInThisSex } = useMemo(() => {
        const month = event?.date
            ? new Date(event.date).toLocaleString('es-ES', { month: 'long' })
            : 'Mes'

        const day = event?.date
            ? event.date.split('T')[0].split('-')[2]
            : 'Día'

        const data = getRacecheckRunners(event?.racecheck ?? '')
        const totalRunners = data?.length ?? 0
        const runnersInCategory = data?.filter((r: RacecheckRunner) => r.categoria === categoria).length ?? 0
        const runnersInSex = data?.filter((r: RacecheckRunner) => r.sexo === sexo).length ?? 0

        return {
            eventMonth: month,
            eventDay: day,
            runnersAmount: totalRunners,
            runnersInThisCategory: runnersInCategory,
            runnersInThisSex: runnersInSex
        }
    }, [event?.date, event?.racecheck, categoria, sexo])



    // Validaciones
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
                link.download = `${nombre}-${event?.name}-${dorsal}.png`;
                link.href = imgData;
                link.click();
            });
        } catch (error) {
            console.error('Error al descargar el ticket:', error)
        }
    }



    return (
        <div className="flex flex-col justify-center items-center h-full py-6">
            <div className="mb-6 text-center flex items-center gap-2 w-[90%] max-w-[350px] mx-auto">
                <div>
                    <button
                        type="button"
                        className="h-10 rounded-full w-10 flex items-center justify-center relative select-none gap-2 bg-gray-100 dark:bg-gray-800 transition-colors shadow-md"
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <h1 className='text-2xl font-semibold text-start tracking-tight'>
                    {event?.name}
                </h1>
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


            <div className="flex w-[90%] max-w-[370px] mx-auto flex-col bg-white" id="ticket-container" ref={ticketRef}>

                <div className="px-4">
                    <div className="flex justify-center mb-8 mt-3 relative min-h-8 min-w-20 max-w-20 max-h-8">
                        <Image
                            src="/logo-timecontrol.png"
                            alt="TimeControl Logo"
                            layout='fill'
                            className="max-h-8 max-w-auto"
                        />
                    </div>

                    <div className="flex flex-col items-starts justify-start mb-8 px-3">
                        <div className="flex items-center gap-2 mb-3">
                            <p className="text-lg font-medium tracking-tight text-gray-800">
                                {event?.name}
                            </p>
                        </div>
                        <p className="text-gray-800 text-2xl font-semibold tracking-tight text-start w-full mb-3">
                            {nombre}
                        </p>

                        <div className="flex items-start w-full h-max justify-center">
                            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white border-t-4 border-slate-700">
                                <p className="text-gray-700 text-2xl font-semibold tracking-tight text-start w-full mb-3">
                                    {dorsal}
                                </p>
                            </div>
                            <div className="text-gray-700 text-2xl font-semibold tracking-tight text-start w-full mb-3">
                                {dorsal}
                            </div>

                            <div className="flex flex-col items-start justify-start h-max w-max">
                                <p className="text-gray-500 text-sm font-normal tracking-tight font-mono mb-1">
                                    Tiempo
                                </p>

                                <div className="flex items-baseline justify-start">
                                    <p className="font-mono tracking-tight text-[30px] text-gray-700">
                                        {tiempo?.split('.')[0]}
                                    </p>

                                    <p className="text-gray-500 text-base font-mono">
                                        ,{tiempo?.split('.')[1]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 px-3">
                        <div className='max-w-max mx-auto'>
                            <div className="flex flex-col items-center">
                                <h1 className="text-[40px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                    {posCat || 'N/A'} <span className="text-gray-400 text-xl font-mono -ml-3">
                                        / {runnersInThisCategory || 'N/A'}
                                    </span>
                                </h1>
                            </div>
                            <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                {eventCategories.find((c) => c.matchsWith === categoria)?.name || categoria}
                            </p>
                        </div>

                        <div className='max-w-max mx-auto'>
                            <div className="flex flex-col items-center">
                                <h1 className="text-[40px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                    {posGeneral || 'N/A'} <span className="text-gray-400 text-xl font-mono -ml-3">
                                        / {runnersInThisSex || 'N/A'}
                                    </span>
                                </h1>
                            </div>
                            <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                {eventGenders.find((g) => g.matchsWith === sexo)?.name || sexo}
                            </p>
                        </div>

                        <div className='max-w-max mx-auto'>
                            <div className="flex flex-col items-center">
                                <h1 className="text-[40px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                    {posGeneral || 'N/A'} <span className="text-gray-400 text-xl font-mono -ml-3">
                                        / {runnersAmount || 'N/A'}
                                    </span>
                                </h1>
                            </div>
                            <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                General
                            </p>
                        </div>

                        <div className="flex flex-col items-start justify-end gap-1">
                            <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                Ritmo
                            </p>
                            <h1 className="text-base font-normal tracking-tight text-gray-700 italic font-mono">
                                {ritmo || 'N/A'}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="border-b-2 border-dashed border-gray-200 px-3 py-4">
                </div>

                <div className="flex flex-col items-start gap-2 px-8 pb-8 pt-4 relative">
                    <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                            {event?.locationName || 'Ubicación no especificada'}
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

                    <p className="font-inter tracking-tight text-2xl font-cdark text-gray-700 absolute bottom-6 right-6 z-10">
                        {runner.modalidad || 'N/A'}
                    </p>
                </div>
            </div>


        </div>
    )
}

export default RunnerTicket