import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { SocketManager } from "./managers/socket.manager";
import { RoomManager } from "./managers/room.manager";

const app = express();
const server = http.createServer(app);

const roomManager = new RoomManager();

SocketManager.getInstance(server, roomManager);




app.get("/", (req, res) => {
    res.send("Hello World");
});


server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
