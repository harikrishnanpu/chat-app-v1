import { Server, Socket } from "socket.io";
import { RoomHandler } from "../handlers/room.handler";
import { SignalHandler } from "../handlers/signal.handler";
import { UserManager } from "./user.manager";
import { RoomManager } from "./room.manager";
import { SOCKET_EVENTS } from "../contants/socket.events.constants";




export class SocketManager { 

    private static _instance: SocketManager;
    private _roomManager: RoomManager;
    private _userManager: UserManager;


    private constructor(
        private _io: Server
    ){

        this._roomManager =  new RoomManager();
        this._userManager = new UserManager()

       this._init();
    }

    // --singleton --
    public static getInstance(io: Server): SocketManager {
        if(!SocketManager._instance) {
            console.log("SocketManager initialised -- ");
            SocketManager._instance = new SocketManager(io);
        }
        return SocketManager._instance;
    }

    private _init(): void {

        this._io.on("connection", (socket: Socket) => {

            console.log("Socket connected- ", socket.id);


            new RoomHandler(this._roomManager, this._userManager, socket);

            const signalHandler = new SignalHandler(socket, this._roomManager);


            this._userManager.createUser({
                id: socket.id,
                username: socket.id,
                roomId: null
            });

            signalHandler.registerEvents();


            socket.on("disconnect", () => {
                const currentUser = this._userManager.getUser(socket.id);
                if (!currentUser?.roomId) {
                    this._userManager.removeUser(socket.id);
                    return;
                }

                const roomId = currentUser.roomId;
                const partnerId = this._roomManager.getUser2(roomId, socket.id);

                this._roomManager.leaveRoom(roomId, socket.id);
                this._userManager.removeUser(socket.id);

                if (partnerId) {
                    this._io.to(partnerId).emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
                }
            });

        });


    }


}