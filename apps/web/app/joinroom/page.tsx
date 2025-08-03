'use client'

import { socket } from "@/lib/socket"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { ArrowRight, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function JoinRoom() {
    const [username, setUsername] = useState("");
    const [roomname, setRoomname] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }

        return () => {
            socket.disconnect()
        }
    }, [])

    async function handleJoiningRoom() {
        if (!username || !roomname) {
            setError("Please fill in all fields");
            return;
        }

        // Store user info in localStorage
        localStorage.setItem("username", username)
        localStorage.setItem("room", roomname)

        socket.emit("join_room", { username, room: roomname }, (response: { success: boolean; message: string }) => {
            if (response.success) {
                router.push("/room")
            } else {
               setError(response.message);
            }
        })
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="min-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Join Room</CardTitle>
                    <CardDescription>Join an existing room to start chatting.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label className="font-semibold">Username</Label>
                        <Input 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold">Room Name</Label>
                        <Input 
                            onChange={(e) => setRoomname(e.target.value)} 
                            required 
                            placeholder="Enter room name to join"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                            {error}
                        </div>
                    )}

                    <Button onClick={handleJoiningRoom} className="w-full cursor-pointer">
                        <Users className="w-4 h-4 mr-2" />
                        Join Room
                    </Button>

                    <div className="flex space-x-2">
                      <Button onClick={() => router.push("/createroom")} variant='outline' className="flex-1 cursor-pointer">
                        Create Room Instead
                      </Button>
                      <Button onClick={() => router.push("/")} variant='destructive' className="flex-1 cursor-pointer">
                        Cancel
                      </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 