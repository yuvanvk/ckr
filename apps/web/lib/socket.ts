import { io, Socket } from "socket.io-client"

const URL = process.env.NODE_ENV === "production" ? "https://ckr-ncwi.onrender.com" : "http://localhost:8080";

export const socket: Socket = io(URL)