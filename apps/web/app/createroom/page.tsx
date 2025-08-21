'use client'
import { CreateRoomForm } from "@/components/create-room-form";


export default function CreateRoom() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300">
            <CreateRoomForm />
        </div>
    )
}