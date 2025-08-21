'use client'
import dynamic from "next/dynamic"
import { useCallback, useMemo } from "react"

import { socket } from "@/lib/socket"
import { Button } from "@/workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/workspace/ui/components/card"
import { Input } from "@/workspace/ui/components/input"

import { Send, Users, LogOut, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { SetStateAction, useEffect, useState } from "react"

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
  const MonacoEditor = useMemo(() => dynamic(() => import("@monaco-editor/react"), { ssr: false }), [])
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")

  const languageCodes = {
    javascript: "// Write your code here\nconsole.log('Hello, world!')",
    python: 'print("Hello, world!")',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, world!\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, world!" << std::endl;\n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}',
    typescript: "console.log('Hello, world!');",
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, world!")\n}',
    ruby: 'puts "Hello, world!"',
    php: "<?php\n\necho 'Hello, world!';",
    rust: 'fn main() {\n    println!("Hello, world!");\n}',
    kotlin: 'fun main() {\n    println("Hello, world!")\n}',
    swift: 'print("Hello, world!")',
    csharp: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello, world!");\n    }\n}',
  }

  const [code, setCode] = useState(languageCodes[selectedLanguage]);

  useEffect(() => {
    setCode(languageCodes[selectedLanguage]);
  }, [selectedLanguage, languageCodes]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value ?? "")
  }, [])

  const [output, setOutput] = useState("")

  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
    { value: "typescript", label: "TypeScript" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
    { value: "rust", label: "Rust" },
    { value: "kotlin", label: "Kotlin" },
    { value: "swift", label: "Swift" },
    { value: "csharp", label: "C#" },
  ]

  const runCode = async () => {
    setOutput("Running...")
    if (selectedLanguage === "javascript") {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(code)
        setOutput(result !== undefined ? String(result) : "(No output)")
      } catch (err) {
        setOutput("Error: " + err)
      }
    } else {
      try {
        const response = await fetch('/api/runCode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language: selectedLanguage, code }),
        });

        const data = await response.json();
        if (response.ok) {
          setOutput(data.output);
        } else {
          setOutput(`Error: ${data.error || data.message}`);
        }
      } catch (error) {
        setOutput('An error occurred while running the code.');
      }
    }
  }

  const clearOutput = () => setOutput("")
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [username, setUsername] = useState("")
  const [room, setRoom] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    const storedRoom = localStorage.getItem("room")

    if (!storedUsername || !storedRoom) {
      router.push("/createroom")
      return
    }

    setUsername(storedUsername)
    setRoom(storedRoom)

    if (!socket.connected) {
      socket.connect()
    }

    socket.emit("join_room", { username: storedUsername, room: storedRoom }, (response: { success: any; participants: any; message: SetStateAction<string> }) => {
      if (response.success) {
        setIsConnected(true)
        setParticipants(response.participants || [])
      } else {
        setError(response.message)
      }
    })

    socket.on("receive_message", (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on("user_joined", (data: { message: any }) => {
      setMessages(prev => [...prev, {
        username: "System",
        message: data.message,
        timestamp: new Date().toISOString()
      }])
    })

    socket.on("user_left", (data: { message: any }) => {
      setMessages(prev => [...prev, {
        username: "System",
        message: data.message,
        timestamp: new Date().toISOString()
      }])
    })

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

    socket.emit("send_message", { room, message: newMessage, username }, (response: { success: any; message: SetStateAction<string> }) => {
      if (response.success) {
        setNewMessage("")
      } else {
        setError(response.message)
      }
    })
  }

  const leaveRoom = () => {
    socket.emit("leave_room", {}, (response: { success: any }) => {
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
      <div className="flex justify-center items-center min-h-screen bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300">
        <Card className="w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
            <CardDescription className="text-zinc-700 dark:text-zinc-300">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/createroom")}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-zinc-100 font-semibold py-2 rounded transition"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300">
      {/* Left Side - IDE Canvas Area */}
      <div className="flex-1 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
        <div className="h-full flex flex-col">
          {/* IDE Header */}
          <div className="bg-gray-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">IDE Canvas</h2>
                <p className="text-sm text-gray-600 dark:text-zinc-400">Code editor and collaboration space</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
          {/* IDE Content Area */}
          <div className="flex-1 p-4 flex flex-col gap-4">
            {/* IDE Integration Start */}
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="language" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Language:</label>
              <select
                id="language"
                className="border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition"
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
              >
                {languageOptions.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <Button size="sm" onClick={runCode} className="ml-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-zinc-100 font-semibold py-1 px-3 rounded transition">Run</Button>
              <Button size="sm" variant="outline" onClick={clearOutput} className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Clear</Button>
            </div>
            <div className="flex-1 min-h-[300px] border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
              <MonacoEditor
                height="300px"
                language={selectedLanguage}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false } }}
              />
            </div>
            <div className="mt-2">
              <h4 className="font-semibold text-sm mb-1 text-zinc-800 dark:text-zinc-200">Output:</h4>
              <div className="bg-black text-green-400 rounded p-2 min-h-[60px] whitespace-pre-wrap text-xs">
                {output || <span className="text-gray-400 dark:text-zinc-500">Output will appear here...</span>}
              </div>
            </div>
            {/* IDE Integration End */}
          </div>
        </div>
      </div>

      {/* Right Side - Chat System */}
      <div className="w-96 flex flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
        {/* Chat Header */}
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Room: {room}</h1>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              {isConnected ? "Connected" : "Connecting..."}
            </p>
          </div>
          <Button onClick={leaveRoom} variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-zinc-100 transition">
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>

        {/* Participants List */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
            <h2 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">Participants ({participants.length})</h2>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2 p-1 rounded text-xs text-zinc-800 dark:text-zinc-200">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-800 transition-colors duration-300">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.username === username ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[280px] px-3 py-2 rounded-lg text-sm ${
                message.username === "System"
                  ? "bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 text-center mx-auto"
                  : message.username === username
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
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
        <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={!isConnected}
              className="flex-1 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition"
            />
            <Button onClick={sendMessage} disabled={!isConnected || !newMessage.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-zinc-100 transition">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}