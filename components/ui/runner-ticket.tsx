'use client'

import { EventResponse } from '@/lib/schemas/event.schema'
import { parseRaceData, Runners } from '@/lib/utils'

import React, { useRef } from 'react'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, DownloadIcon, MapPinIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import html2canvas from 'html2canvas'

const RunnerTicket = ({ runner, event }: { runner: Runners, event: EventResponse | undefined }) => {
    const { nombre, sexo, categoria, tiempo, posicion, posSex, posCat, dorsal, ritmo } = runner;
    const router = useRouter()
    const ticketRef = useRef<HTMLDivElement>(null);
    const eventMonth = event?.date
        ? new Date(event?.date).toLocaleString('es-ES', { month: 'long' })
        : 'Mes'
    const eventDay = event?.date
        ? event?.date.split('T')[0].split('-')[2]
        : 'Día'

    if (!event) return null

    const racecheckData = parseRaceData(event.racecheck ?? '')
    const runnersAmount = racecheckData.runners?.length ?? 0
    const runnersInThisCategory = racecheckData.runners?.filter((runner: Runners) => runner.categoria === categoria).length ?? 0
    const runnersInThisSex = racecheckData.runners?.filter((runner: Runners) => runner.sexo === sexo).length ?? 0

    const handleDownload = async () => {
        if (ticketRef.current) {
            const canvas = await html2canvas(ticketRef.current)
            const image = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.href = image
            link.download = `ticket-${nombre}-${dorsal}.png`
            link.click()
        }
    }

    if (!event) return null

    return (
        <div className="bg-white dark:bg-gray-950 flex flex-col justify-center items-center h-full py-6">


            <div className="mb-6 text-center flex items-center gap-2 w-[90%] max-w-[350px] mx-auto">

                <div>
                    <button
                        type="button"
                        className={`h-10 rounded-full w-10 flex items-center justify-center relative select-none gap-2 bg-white border-2 border-gray-100 hover:bg-gray-100 transition-colors shadow-md`}
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button >
                </div>

                <h1 className='text-2xl font-semibold text-start tracking-tight'>
                    {event?.name}
                </h1>
            </div>

            <div className="w-[90%] max-w-[350px] border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden rounded-3xl relative" ref={ticketRef}>

                <div className="relative mx-auto h-full max-h-max max-w-[370px] shadow-xl bg-white">
                    <div className="flex flex-col">
                        <div className="px-8 pt-4 pb-8 border-b-2 border-dashed border-gray-200">

                            <div className="flex justify-center mb-8 mt-3 relative min-h-8 min-w-20 max-w-20 max-h-8">
                                <Image
                                    src="/logo-timecontrol.png"
                                    alt="TimeControl Logo"
                                    layout='fill'
                                    className=" max-h-8 max-w-auto"
                                />
                            </div>

                            <div className="flex flex-col items-starts justify-start gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-medium tracking-tight text-gray-800">
                                        {event?.name}
                                    </p>
                                </div>
                                <p className="text-gray-800 text-2xl font-semibold tracking-tight text-start w-full">
                                    {nombre}
                                </p>

                                <div className="flex gap-4 h-full">
                                    <div className="flex flex-col justify-between items-center bg-white dark:bg-gray-100 border border-gray-100 rounded-xl overflow-hidden h-[60px] w-[80px] shadow">
                                        <div className="w-full h-4 bg-gradient-to-r from-red-400 to-red-500 dark:from-slate-800 dark:to-slate-900">
                                            <div className="justify-between flex items-center py-1.5 px-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-100"></div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-100"></div>
                                            </div>
                                        </div>

                                        <div className="mb-1">
                                            <p className="font-bold text-2xl text-gray-700 dark:text-gray-800 text-center">
                                                {dorsal}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start max-w-max mx-auto">
                                        <p className="text-gray-500 text-sm font-normal tracking-tight font-mono">
                                            Tiempo
                                        </p>

                                        <div className="flex items-end justify-end h-[50px]">
                                            <p className="font-mono tracking-tight text-[30px] text-gray-700">
                                                {tiempo?.split('.')[0] || '00'}
                                            </p>

                                            <p className="text-gray-500 text-base mb-1 font-mono">
                                                ,{tiempo?.split('.')[1]}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className='max-w-max mx-auto'>
                                    <div className="flex flex-col items-center">
                                        <h1 className="text-[40px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                            {posCat} <span className="text-gray-400 text-xl font-mono -ml-3">
                                                / {runnersInThisCategory || 'N/A'}
                                            </span>
                                        </h1>
                                    </div>
                                    <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                        {categoria}
                                    </p>
                                </div>

                                <div className='max-w-max mx-auto'>
                                    <div className="flex flex-col items-center">
                                        <h1 className="text-[40px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                            {posSex} <span className="text-gray-400 text-xl font-mono -ml-3">
                                                / {runnersInThisSex || 'N/A'}
                                            </span>
                                        </h1>
                                    </div>
                                    <p className="text-gray-500 text-xs font-normal tracking-tight font-mono">
                                        {sexo}
                                    </p>
                                </div>

                                <div className='max-w-max mx-auto'>
                                    <div className="flex flex-col items-center">
                                        <h1 className="text-[40px] -mt-2 font-normal tracking-tight text-gray-700 italic font-mono">
                                            {posicion} <span className="text-gray-400 text-xl font-mono -ml-3">
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
                                    <h1 className="text-base  font-normal tracking-tight text-gray-700 italic font-mono">
                                        {ritmo}
                                    </h1>
                                </div>
                            </div>

                        </div>

                        <div className="flex flex-col items-start gap-2 px-8 pb-8 pt-4 relative">
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

                            <p className="font-inter tracking-tight text-2xl font-black text-gray-700 absolute bottom-6 right-6 z-10">
                                {runner.modalidad}
                            </p>
                        </div>


                        <div className="absolute top-2 right-2 z-10">
                            <button
                                type="button"
                                className={`h-10 rounded-full w-10 flex items-center justify-center relative select-none gap-2 bg-white border-2 border-gray-100 hover:bg-gray-100 transition-colors shadow-md`}
                                onClick={handleDownload}
                            >
                                <DownloadIcon className="w-5 h-5 text-blue-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default RunnerTicket