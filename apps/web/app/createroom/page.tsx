'use client'
import { CreateRoomForm } from "@/components/create-room-form";
import Hyperspeed from "@/components/Hyperspeed/Hyperspeed";

export default function CreateRoom() {
    return <div className="flex justify-center items-center h-screen">
        {/* <Hyperspeed /> */}
        <CreateRoomForm />
    </div>
}