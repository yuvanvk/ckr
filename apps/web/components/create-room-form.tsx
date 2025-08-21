'use client'

import { socket } from "@/lib/socket"
import { Button } from "@/workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/workspace/ui/components/card"
import { Input } from "@/workspace/ui/components/input"
import { Label } from "@/workspace/ui/components/label"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export const CreateRoomForm = () => {
    const [username, setUsername] = useState("");
    const [roomname, setRoomname] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }

        return () => {
            socket.disconnect()
        }
    }, [])

    async function handleCreatingRoom() {
        if (!username || !roomname) return;

        // Store user info in localStorage
        localStorage.setItem("username", username)
        localStorage.setItem("room", roomname)

        socket.emit("join_room", { username, room: roomname }, (response: { success: boolean; message: string }) => {
            if (response.success) {
                router.push("/room")
            } else {
               console.error(response.message);
               
            }
        })
    }

    return (
        <Card className="min-w-sm w-full max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl text-zinc-900 dark:text-zinc-100">Create Room</CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">Create a room to collaborate on the project.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Label className="font-semibold text-zinc-800 dark:text-zinc-200">Username</Label>
                    <Input 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition"
                        placeholder="Enter your username"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="font-semibold text-zinc-800 dark:text-zinc-200">Room Name</Label>
                    <Input 
                        onChange={(e) => setRoomname(e.target.value)} 
                        required 
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition"
                        placeholder="Enter room name"
                    />
                </div>

                <Button 
                    onClick={handleCreatingRoom} 
                    className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-zinc-100 font-semibold py-2 rounded transition flex items-center justify-center gap-2"
                >
                    Create a room <ArrowRight />
                </Button>

                <div className="flex space-x-2">
                    <Button 
                        onClick={() => router.push("/joinroom")} 
                        variant='outline' 
                        className="flex-1 cursor-pointer border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    >
                        Join Room Instead
                    </Button>
                    <Button 
                        onClick={() => router.push("/")} 
                        variant='destructive' 
                        className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-zinc-100 transition"
                    >
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}