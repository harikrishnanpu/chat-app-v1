import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { ISocketManager } from "../interfaces/ISocketManager";
import { IRoomManager } from "../interfaces/IRoomManager";


export class SocketManager implements ISocketManager {

    private readonly io: Server;
    public static instance: SocketManager;

    private constructor(
        server: HttpServer,
        roomManager: IRoomManager
    ) {
        this.io = new Server(server,{
            cors: {
                origin: "*"
            }
        });

        this.connect(roomManager);
    }

    // -- singleton  -- --
    public static getInstance(server: HttpServer, roomManager: IRoomManager): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager(server, roomManager);
        }   
        return SocketManager.instance;
    }



    connect() {
        this.io.on("connection", (socket) => {

            console.log("a user connected");
            // console.log(socket);


            socket.on("disconnect", () => {
                console.log("a user disconnected");
            });

        });
    }

    

    public getIO(): Server {
        return this.io;
    }



}