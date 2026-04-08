import { Server } from "socket.io";
import { Server as HttpServer } from "http";


export class SocketManager {

    private io: Server;
    public static instance: SocketManager;

    private constructor(
        server: HttpServer
    ) {
        this.io = new Server(server,{
            cors: {
                origin: "*"
            }
        });

        this.connect();
    }

    // -- singleton  -- --
    public static getInstance(server: HttpServer): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager(server);
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




}