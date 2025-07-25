'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { CheckIcon, ExternalLink, EyeIcon, FolderIcon, Loader2 } from 'lucide-react'
import { generateQRUrl } from '@/lib/utils'
import { QrCodeIcon } from 'lucide-react'
import Modal from '../ui/modal'
import { AnimatePresence, motion } from 'framer-motion'

interface QRGeneratorProps {
    eventId: string
    eventName: string
    maxParticipants: number
    stayAfterCreation: boolean
    setStayAfterCreation: (stayAfterCreation: boolean) => void
}

export default function QRGenerator({ eventId, eventName, maxParticipants, stayAfterCreation, setStayAfterCreation }: QRGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [progress, setProgress] = useState(0)
    const baseUrl = process.env.NEXT_PUBLIC_QR_URL
    const [openTestQR, setOpenTestQR] = useState(false)
    const [selectedDorsal, setSelectedDorsal] = useState<number | null>(null)

    const generateQRCode = (dorsal: number): string => {
        return generateQRUrl(eventId, dorsal)
    }

    const svgToBlob = (svgString: string): Blob => {
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        return blob
    }

    const downloadQRs = async () => {
        setIsGenerating(true)
        setProgress(0)

        try {
            const zip = new JSZip()
            const qrFolder = zip.folder(`QR_${eventName.replace(/[^a-zA-Z0-9]/g, '_')}`)

            if (!qrFolder) {
                throw new Error('No se pudo crear la carpeta en el ZIP')
            }

            // Generar códigos QR para cada participante
            for (let dorsal = 1; dorsal <= maxParticipants; dorsal++) {
                const qrUrl = generateQRCode(dorsal)

                console.log('qrUrl')
                console.log(qrUrl)

                // Crear un elemento temporal para renderizar el QR
                const tempDiv = document.createElement('div')
                tempDiv.style.position = 'absolute'
                tempDiv.style.left = '-9999px'
                tempDiv.style.top = '-9999px'
                document.body.appendChild(tempDiv)

                // Renderizar el QR como SVG
                const { createRoot } = await import('react-dom/client')
                const root = createRoot(tempDiv)

                root.render(
                    <QRCodeSVG
                        value={qrUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                    />
                )

                // Esperar a que se renderice
                await new Promise(resolve => setTimeout(resolve, 50))

                // Obtener el SVG renderizado
                const svgElement = tempDiv.querySelector('svg')
                if (svgElement) {
                    const svgString = svgElement.outerHTML
                    const blob = svgToBlob(svgString)

                    // Agregar al ZIP
                    qrFolder.file(`QR_Dorsal_${dorsal.toString().padStart(3, '0')}.svg`, blob)
                }

                // Limpiar
                root.unmount()
                document.body.removeChild(tempDiv)

                // Actualizar progreso
                setProgress((dorsal / maxParticipants) * 100)
            }

            // Generar y descargar el ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const fileName = `QR_${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${maxParticipants}_participantes.zip`
            saveAs(zipBlob, fileName)

            setProgress(100)
        } catch (error) {
            console.error('Error generando códigos QR:', error)
        } finally {
            setIsGenerating(false)
            setProgress(0)
        }
    }

    const isEmpty = !eventName || !maxParticipants || !baseUrl || maxParticipants === 0

    return (
        <div className="w-full h-max rounded-3xl bg-yellow-100 dark:bg-yellow-200 shadow-lg md:shadow-none p-2">

            {isEmpty ? (
                <div className="flex flex-col gap-2 p-2 w-full">
                    <p className='text-sm text-gray-600'>
                        No se puede generar el listado de QR porque no se han proporcionado los datos necesarios
                    </p>
                </div>
            ) : (
                <div className='flex flex-col gap-6 w-full'>
                    <div className='flex flex-col gap-2 p-2'>
                        <div className="flex items-center gap-2">
                            <QrCodeIcon className='w-5 h-5 text-gray-950' />
                            <h3 className='text-lg font-semibold text-gray-900'>
                                Códigos QR
                            </h3>
                        </div>
                        {eventId ? (
                            <p className='text-sm text-gray-600'>
                                Descarga el listado de códigos QR para que los participantes puedan acceder a su ticket personalizado.
                            </p>
                        ) : (
                            <div className='flex flex-col gap-2'>
                                <p className='text-sm text-gray-600'>
                                    No se puede generar el listado de QR porque no se ha creado el evento
                                </p>

                                <div className='flex items-center gap-3 cursor-pointer' onClick={() => setStayAfterCreation(!stayAfterCreation)}>
                                    <div className='min-w-4 min-h-4 rounded-md overflow-visible border-gray-300 dark:border-gray-700 appearance-none checked:bg-gray-950 checked:border-gray-950 flex items-center justify-center bg-gray-950' >
                                        {stayAfterCreation && <CheckIcon className='w-4 h-4 text-white' />}
                                    </div>
                                    <p className='text-sm text-gray-600'>
                                        Permanecer en el sitio hasta que se haya creado el evento
                                    </p>
                                </div>

                            </div>
                        )}
                    </div>

                    {eventId && (
                        <div className="flex items-center gap-2 justify-between">
                            <button
                                type="button"
                                className='rounded-btn !h-12 !pr-4 !bg-gray-950 max-w-max flex items-center gap-2 !text-white'
                                onClick={downloadQRs}
                                disabled={isGenerating || isEmpty}
                            >
                                <FolderIcon className='w-5 h-5' />
                                <div className='flex flex-col text-start'>
                                    <p className='text-sm font-medium'>Descargar .ZIP</p>
                                    <p className='text-xs text-gray-500'>{maxParticipants} archivos
                                    </p>
                                </div>

                                {isGenerating && (
                                    <>
                                        <Loader2 className='w-4 h-4 animate-spin' />
                                        <p className='text-sm font-medium'> {progress}%</p>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className='rounded-btn !bg-transparent max-w-max flex items-center gap-2 !text-black'
                                onClick={() => setOpenTestQR(true)}
                                disabled={isGenerating || isEmpty}
                            >
                                <p className='text-sm font-medium'>Probar QRs</p>
                                <EyeIcon className='w-4 h-4' />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <Modal
                title={``}
                isOpen={openTestQR}
                onClose={() => setOpenTestQR(false)}
                className="md:!w-[350px] h-[600px]"
                children={
                    <div className="flex flex-col gap-5 w-full items-center justify-center py-6">
                        <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-300 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden h-15 w-21 relative max-w-[100px]">
                            <div className="w-full h-4.5 absolute top-0 left-0 bg-red-400 dark:bg-slate-800">
                                <div className="justify-between flex items-center py-1.5 px-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-300"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-300"></div>
                                </div>
                            </div>

                            <input
                                type="number"
                                className="border-b-2 border-gray-300 rounded-md p-3 w-full bg-transparent font-bold text-2xl h-16 mt-3 text-gray-700 dark:text-gray-800 text-center placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
                                placeholder=""
                                min={1}
                                max={maxParticipants}
                                value={selectedDorsal ? selectedDorsal : ''}
                                onChange={(e) => {
                                    setSelectedDorsal(e.target.value ? Number(e.target.value) : null)
                                }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {typeof selectedDorsal === 'number' && selectedDorsal > 0 ? (
                                <motion.div
                                    key={selectedDorsal}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className='flex flex-col gap-2 items-center justify-center'
                                >
                                    <div className="h-60 w-60 rounded-xl overflow-hidden">
                                        <QRCodeSVG
                                            className="w-full h-full"
                                            value={generateQRUrl(eventId, selectedDorsal)}
                                            size={256}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <p className='text-xs text-gray-500 mt-3 text-wrap p-3 text-center max-w-md'>
                                        {generateQRUrl(eventId, selectedDorsal)}
                                    </p>

                                    <button
                                        type='button'
                                        className='rounded-btn max-w-max flex items-center gap-2 w-full'
                                        onClick={() => window.open(generateQRUrl(eventId, selectedDorsal), '_blank')}
                                    >
                                        <p className='text-sm font-medium'>
                                            Ir al ticket
                                        </p>
                                        <ExternalLink className='w-4 h-4' />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className='flex flex-col gap-2 items-center justify-center w-full px-6'
                                >
                                    <p className='text-sm font-medium mb-72 text-center'>
                                        Ingrese un número
                                        <br />
                                        <span className="font-bold text-3xl">1 - {maxParticipants}
                                        </span>
                                        <br />
                                        para ver el QR
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                }
            />
        </div >
    )
}