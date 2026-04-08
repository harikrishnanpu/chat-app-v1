import { Server } from "socket.io";



export interface ISocketManager {
  getIO(): Server;
}