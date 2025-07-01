"use client"

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export function SignInButton() {
    const { data: session } = useSession()

    if (session) {
        return (
            <button className="bg-gray-950 dark:bg-white rounded-full text-white dark:text-gray-950 flex items-center gap-2 hover:opacity-80 transition-all duration-300" onClick={() => signOut()}>
                <div className="relative w-10 h-10 overflow-hidden rounded-full">
                    <Image src={session.user?.image || ''} alt="User" width={40} height={40} className="object-cover" />
                </div>
            </button>
        );
    }
    return (
        <button className="bg-gray-900 dark:bg-white rounded-full px-6 py-3 text-white dark:text-gray-950 flex items-center gap-2 hover:opacity-80 transition-all duration-300" onClick={() => signIn("google")}>
            <p className="text-xs font-semibold tracking-tight">
                Iniciar sesión
            </p>
        </button>
    );
}
