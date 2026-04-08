import { Server } from "socket.io";



export class SocketHandler {

    constructor(
        private io: Server
    ) {
    }

    
    handleConnection(socket: Socket) {
        console.log("a user connected");
    
    }


}