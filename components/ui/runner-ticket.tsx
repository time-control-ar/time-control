'use client'

import React, { useRef } from 'react'
import { ArrowLeftIcon, CalendarIcon, DownloadIcon, MapPinIcon } from 'lucide-react'
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
                let runnerName = racecheck.nombre.toLowerCase();
                runnerName = runnerName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const eventName = event?.name;
                link.download = `${runnerName}, ${eventName}.png`;
                link.href = imgData;
                link.click();
            });
        } catch (error) {
            console.error('Error al descargar el ticket:', error)
        }
    }



    return (
        <div className="flex flex-col justify-center items-center h-full py-6">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 w-full max-w-[340px]">
                <div className="mb-6 text-start flex gap-3" style={{ alignItems: 'center' }}>
                    <div>
                        <button
                            type="button"
                            className="custom_button transition-all rounded-full flex items-center justify-center active:scale-95 active:rotate-45 duration-100"
                            onClick={() => router.push('/')}
                        >
                            <ArrowLeftIcon className="h-4 w-4 tracking-tight   " />
                        </button>
                        <p className="text-xs font-semibold tracking-tight"></p>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Ticket <span className="capitalize">{runner.racecheck.nombre.toLocaleLowerCase()}</span>
                    </h1>
                </div>
                <div className="flex w-full max-w-[350px] mx-auto flex-col bg-white rounded-2xl pt-4" id="ticket-container" ref={ticketRef}>
                    {event?.logo ? (
                        <div className="relative px-8 h-16 w-36 mx-auto">
                            <Image
                                src={event?.logo || '/logo-timecontrol.png'}
                                alt="TimeControl Logo"
                                layout='fill'
                                className="max-h-16 object-contain object-center"
                            />
                        </div>
                    ) : (
                        <p className="text-gray-700 text-lg font-semibold tracking-tight text-start w-full">
                            {event?.name}
                        </p>
                    )}
                    < div className="flex flex-col gap-3 py-6 px-8 h-full">
                        <div className="flex gap-4" style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <div className="h-max w-12 bg-slate-100 rounded-md">
                                <div className="h-[8px] px-1 w-full max flex items-center justify-between bg-gradient-to-r from-slate-600 to-slate-900 rounded-t-md">
                                    <div className="rounded-full bg-white dark:bg-gray-100 w-[2px] h-[2px]"></div>
                                    <div className="rounded-full bg-white dark:bg-gray-100 w-[2px] h-[2px]"></div>
                                </div>

                                <div style={{ margin: '5px 0' }}>
                                    <p className="font-bold text-gray-700 dark:text-gray-800 text-center font-mono text-sm">
                                        {parseInt(runner.racecheck.dorsal)}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[20px] font-semibold tracking-tight text-gray-700 capitalize">
                                {racecheck.nombre.toLocaleLowerCase()}
                            </p>
                        </div>

                        <div className="flex justify-between mt-auto" style={{ alignItems: 'center' }}>
                            <div className="flex flex-col">
                                <div className="h-min flex justify-start" style={{ alignItems: 'end' }}>
                                    <p className="font-mono tracking-tight text-base text-black">
                                        {racecheck.tiempo?.split('.')[0]}
                                        <span className="text-gray-500 text-base font-mono">
                                            ,{racecheck.tiempo?.split('.')[1]}
                                        </span>
                                    </p>
                                </div>

                                <h1 className="text-xs font-normal tracking-tight text-gray-400 font-mono">
                                    Ritmo: {racecheck.ritmo || 'N/A'}
                                </h1>
                            </div>

                            <div className="flex justify-center relative min-h-8 min-w-20 max-w-20 max-h-8 my-auto">
                                <Image
                                    src="/logo-timecontrol.png"
                                    alt="TimeControl Logo"
                                    layout='fill'
                                    className="max-h-9 max-w-auto"
                                />
                            </div>

                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div className="max-w-max mx-auto">
                                <h1 className="text-2xl font-semibold tracking-tight text-gray-700 italic pb-3">
                                    {runner.modality.name}
                                </h1>
                                <p className="text-gray-500 text-xs font-normal tracking-tight">
                                    Modalidad
                                </p>
                            </div>
                            <div className="max-w-max mx-auto">
                                <h1 className="text-2xl font-semibold tracking-tight text-gray-700 italic pb-3">
                                    {runner.posSexo || 'N/A'}
                                    <span className="text-gray-400 text-base font-normal ml-3">
                                        / {metrics?.runnersBySameGender || 'N/A'}
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-xs font-normal tracking-tight">
                                    Pos. Sexo
                                </p>
                            </div>
                            <div className='max-w-max mx-auto'>
                                <h1 className="text-2xl font-semibold tracking-tight text-gray-700 italic pb-3">
                                    {posCat || 'N/A'}
                                    <span className="text-gray-400 text-base font-normal ml-3">
                                        / {metrics?.runnersBySameCategory || 'N/A'}
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-xs font-normal tracking-tight">
                                    {runner.category.name}
                                </p>
                            </div>
                            <div className='max-w-max mx-auto mt-auto'>
                                <h1 className="text-2xl font-semibold tracking-tight text-gray-700 italic pb-3">
                                    {posGeneral || 'N/A'}
                                    <span className="text-gray-400 text-base font-normal ml-3">
                                        / {metrics?.runnersBySameModality || 'N/A'}
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-xs font-normal tracking-tight">
                                    General
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="border-b-2 border-dashed border-gray-200 px-3">
                    </div>

                    <div className="flex flex-col items-start px-8 pb-8 pt-4 relative">

                        <p className="text-gray-700 text-base font-semibold tracking-tight text-start w-full">
                            {event?.name}
                        </p>


                        <div className="flex flex-row h-max gap-2 mt-3" style={{ alignItems: 'end' }}>
                            <div>
                                <MapPinIcon className="w-4 h-4 text-red-500" />
                            </div>
                            <p className="text-gray-500 text-xs font-normal tracking-tight">
                                {event?.location.name || 'Ubicación no especificada'}
                            </p>
                        </div>
                        <div className="flex flex-row h-max gap-2 mt-3" style={{ alignItems: 'end' }}>
                            <div>
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                            </div>
                            <p className="text-gray-500 text-xs font-normal tracking-tight">
                                {event?.date}
                            </p>
                        </div>
                    </div>
                </div >
                <div className="flex py-3">
                    <p className="text-gray-500 dark:text-gray-200 text-sm font-normal tracking-tight mr-2">
                        Este ticket esta sujeto a cambios
                    </p>
                    <button
                        type="button"
                        className="w-max flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-sky-500 to-sky-400 rounded-md hover:opacity-90 transition-all duration-75 ml-auto font-mono tracking-tight text-white"
                        onClick={handleDownload}
                    >
                        <p className="text-xs font-semibold tracking-tight">
                            Descargar
                        </p>
                        <DownloadIcon className="h-4 w-4 tracking-tight   " />
                    </button>
                </div>
            </div>


        </div >
    )
}

export default RunnerTicket