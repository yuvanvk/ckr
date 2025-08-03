'use client'

import { socket } from "@/lib/socket"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

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

    return <Card className="min-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Create Room</CardTitle>
            <CardDescription>Create a room to collaborate on the project.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
            <div className="space-y-2">
                <Label className="font-semibold">Username</Label>
                <Input onChange={(e) => setUsername(e.target.value)} required />
            </div>

            <div className="space-y-2">
                <Label className="font-semibold">Room Name</Label>
                <Input onChange={(e) => setRoomname(e.target.value)} required />
            </div>

            <Button onClick={handleCreatingRoom} className="w-full cursor-pointer">Create a room<ArrowRight /></Button>

            <div className="flex space-x-2">
              <Button onClick={() => router.push("/joinroom")} variant='outline' className="flex-1 cursor-pointer">
                Join Room Instead
              </Button>
              <Button onClick={() => router.push("/")} variant='destructive' className="flex-1 cursor-pointer">
                Cancel
              </Button>
            </div>
        </CardContent>
    </Card>
}