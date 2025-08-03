'use client'

import { socket } from "@/lib/socket"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"

import { Send, Users, LogOut, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Message {
  username: string
  message: string
  timestamp: string
}

interface Participant {
  id: string
  username: string
}

export default function RoomPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [username, setUsername] = useState("")
  const [room, setRoom] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  useEffect(() => {
    // Get user info from localStorage or URL params
    const storedUsername = localStorage.getItem("username")
    const storedRoom = localStorage.getItem("room")
    
    if (!storedUsername || !storedRoom) {
      router.push("/createroom")
      return
    }

    setUsername(storedUsername)
    setRoom(storedRoom)

    // Connect to socket
    if (!socket.connected) {
      socket.connect()
    }

    // Join room
    socket.emit("join_room", { username: storedUsername, room: storedRoom }, (response) => {
      if (response.success) {
        setIsConnected(true)
        setParticipants(response.participants || [])
      } else {
        setError(response.message)
      }
    })

    // Listen for messages
    socket.on("receive_message", (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    // Listen for user joined
    socket.on("user_joined", (data) => {
      setMessages(prev => [...prev, {
        username: "System",
        message: data.message,
        timestamp: new Date().toISOString()
      }])
    })

    // Listen for user left
    socket.on("user_left", (data) => {
      setMessages(prev => [...prev, {
        username: "System",
        message: data.message,
        timestamp: new Date().toISOString()
      }])
    })

    // Listen for room participants updates
    socket.on("room_participants", (participants: Participant[]) => {
      setParticipants(participants)
    })

    return () => {
      socket.off("receive_message")
      socket.off("user_joined")
      socket.off("user_left")
      socket.off("room_participants")
    }
  }, [router])

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return

    socket.emit("send_message", { room, message: newMessage, username }, (response) => {
      if (response.success) {
        setNewMessage("")
      } else {
        setError(response.message)
      }
    })
  }

  const leaveRoom = () => {
    socket.emit("leave_room", {}, (response) => {
      if (response.success) {
        localStorage.removeItem("username")
        localStorage.removeItem("room")
        router.push("/createroom")
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/createroom")} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - IDE Canvas Area */}
      <div className="flex-1 bg-white border-r">
        <div className="h-full flex flex-col">
          {/* IDE Header */}
          <div className="bg-gray-100 border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">IDE Canvas</h2>
                <p className="text-sm text-gray-600">Code editor and collaboration space</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
          
          {/* IDE Content Area */}
          <div className="flex-1 p-4">
            <div className="h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">IDE Canvas</h3>
                <p className="text-sm">This area is reserved for IDE integration</p>
                <p className="text-xs mt-2">Code editor, file tree, and collaboration tools will be integrated here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Chat System */}
      <div className="w-96 flex flex-col bg-white border-l">
        {/* Chat Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Room: {room}</h1>
            <p className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Connecting..."}
            </p>
          </div>
          <Button onClick={leaveRoom} variant="destructive" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>

        {/* Participants List */}
        <div className="border-b p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-4 h-4" />
            <h2 className="font-semibold text-sm">Participants ({participants.length})</h2>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2 p-1 rounded text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="truncate">{participant.username}</span>
                {participant.username === username && (
                  <span className="text-blue-500 text-xs">(You)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.username === username ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[280px] px-3 py-2 rounded-lg text-sm ${
                message.username === "System" 
                  ? "bg-gray-100 text-gray-600 text-center mx-auto"
                  : message.username === username
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 border"
              }`}>
                {message.username !== "System" && (
                  <div className="text-xs opacity-75 mb-1">
                    {message.username}
                  </div>
                )}
                <div className="text-sm break-words">{message.message}</div>
                <div className="text-xs opacity-50 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={!isConnected}
              className="flex-1 text-sm"
            />
            <Button onClick={sendMessage} disabled={!isConnected || !newMessage.trim()} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 