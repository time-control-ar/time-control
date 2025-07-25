"use client"

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Modal from './modal';
import { useState } from 'react';

export function SignInButton() {
    const { data: session } = useSession()
    const [isOpenSignOutModal, setIsOpenSignOutModal] = useState(false)

    const handleOpenSignOutModal = () => {
        setIsOpenSignOutModal(true)
    }

    const handleCloseSignOutModal = () => {
        setIsOpenSignOutModal(false)
    }

    const handleConfirm = () => {
        signOut()
        handleCloseSignOutModal()
    }

    if (session) {
        return (
            <>
                <button type="button" className="bg-gray-950 dark:bg-white rounded-full text-white dark:text-gray-950 flex items-center gap-2 hover:opacity-80 transition-all duration-300" onClick={() => handleOpenSignOutModal()}>
                    <div className="relative h-8 w-8 md:w-10 md:h-10 overflow-hidden rounded-full">
                        <Image src={session.user?.image || ''} alt="User" width={40} height={40} className="object-cover" />
                    </div>
                </button>

                <Modal
                    isOpen={isOpenSignOutModal}
                    onClose={handleCloseSignOutModal}
                    title=""
                    className="!max-w-[440px]"
                >
                    <div className="flex flex-col items-center justify-center h-min gap-6 px-6 pb-6">
                        <div className="relative h-12 w-12 md:w-16 md:h-16 overflow-hidden rounded-full">
                            <Image src={session.user?.image || ''} alt="User" layout='fill' className="object-cover" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            ¿Desea cerrar sesión de <span className="font-medium">{session.user?.name}</span>?
                        </p>

                        <div className="flex justify-end gap-2 mt-auto">
                            <button type="button" className="rounded-btn w-max" onClick={handleConfirm}>
                                <p className="text-xs font-semibold tracking-tight">
                                    Si, cerrar sesión
                                </p>
                            </button>
                        </div>
                    </div>
                </Modal>
            </>
        );
    }
    return (
        <>
            <button type="button" className="rounded-btn w-max" onClick={() => signIn("google")}>
                <p className="text-xs font-semibold tracking-tight">
                    Iniciar sesión
                </p>
            </button>

        </>
    );
}
