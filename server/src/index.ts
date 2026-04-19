import express from "express";
import http from "node:http";
import { SocketManager } from "./managers/socket.manager";
import { Server } from "socket.io";
import cors from "cors";
import { MediasoupManager } from "./managers/mediaSoupmanager";

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: "*"
    }
});

const mediasoupManager = MediasoupManager.getInstance();
mediasoupManager.init();
SocketManager.getInstance(io, mediasoupManager);
 
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/room", (req, res) => {
    console.log(req.body);
    const roomId = Math.floor(Math.random() * 1000000);
    res.json({ roomId: roomId.toString() });
});

app.post("/broadcast", (req,res) => {
    console.log(req.body);
    const roomId = Math.floor(Math.random() * 1000000);
    res.json({ roomId: roomId.toString() });
})


server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
