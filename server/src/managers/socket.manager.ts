import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { ISocketManager } from "../interfaces/ISocketManager";
import { IRoomManager } from "../interfaces/IRoomManager";
import { IUserManager } from "../interfaces/IUserManager";


export class SocketManager implements ISocketManager {

    private readonly io: Server;
    public static instance: SocketManager;

    private constructor(
        server: HttpServer,
        roomManager: IRoomManager,
        userManager: IUserManager
    ) {
        this.io = new Server(server,{
            cors: {
                origin: "*"
            }
        });

        this.connect(roomManager, userManager);
    }

    // -- singleton  -- --
    public static getInstance(server: HttpServer, roomManager: IRoomManager, userManager: IUserManager): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager(server, roomManager, userManager);
        }   
        return SocketManager.instance;
    }



    connect(roomManager: IRoomManager, userManager: IUserManager) {
        this.io.on("connection", (socket) => {

            console.log("a user connected");
            // console.log(socket);
            const user = userManager.createUser(socket.id, "newuser");
            console.log("user added")


            socket.on("disconnect", () => {
                console.log("a user disconnected");
            });

        });
    }

    

    public getIO(): Server {
        return this.io;
    }



}