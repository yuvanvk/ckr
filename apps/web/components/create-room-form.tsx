import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ArrowRight } from "lucide-react"
export const CreateRoomForm = () => {
    return <Card className="min-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Create Room</CardTitle>
            <CardDescription>Create a room to collaborate on the project.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
            <div className="space-y-2">
                <Label className="font-semibold">Username</Label>
                <Input />
            </div>

            <div className="space-y-2">
                <Label className="font-semibold">Room Name</Label>
                <Input />
            </div>

            <Button className="w-full cursor-pointer">Create a room<ArrowRight /></Button>

            <Button variant='destructive' className="w-full cursor-pointer">Cancel</Button>
        </CardContent>
    </Card>
}