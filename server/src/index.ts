import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { SocketManager } from "./managers/socket.manager";
import { RoomManager } from "./managers/room.manager";
import { UserManager } from "./managers/user.manager";
import { RoomHandler } from "./handlers/room.handler";
import { SignalHandler } from "./handlers/signal.handler";

const app = express();
const server = http.createServer(app);




app.get("/", (req, res) => {
    res.send("Hello World");
});


server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
