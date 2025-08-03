import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { MessageCircle, Plus, Users } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center justify-center gap-8 p-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">CKR Chat</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-md">
            Real-time chat rooms for seamless collaboration and communication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/createroom">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Create Room</CardTitle>
                <CardDescription>
                  Start a new chat room and invite others to join
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Create New Room
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/joinroom">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Join Room</CardTitle>
                <CardDescription>
                  Join an existing room to start chatting with others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Join Existing Room
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Powered by Socket.IO and Next.js</p>
        </div>
      </div>
    </div>
  )
}
