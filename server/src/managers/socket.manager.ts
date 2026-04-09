import { Socket } from "socket.io";
import { IRoomManager } from "../interfaces/IRoomManager";
import { ISignalHandler } from "../interfaces/ISignalHandler";
import { SOCKET_EVENTS } from "../contants/socket.events.constants";
import { IUserManager } from "../interfaces/IUserManager";
import { IRoomHandler } from "../interfaces/IRoomHandler";




export class SocketManager { 

    private static _instance: SocketManager;


    private constructor(
        private _socket: Socket,
        private _roomHandler: IRoomHandler,
        private _signalHandler: ISignalHandler,
        private _userManager: IUserManager,
    ){
       this._init();
    }

    public static getInstance(socket: Socket, roomHandler: IRoomHandler, signalHandler: ISignalHandler, userManager: IUserManager): SocketManager {
        if(!SocketManager._instance) {
            SocketManager._instance = new SocketManager(socket, roomHandler, signalHandler, userManager);
        }
        return SocketManager._instance;
    }

    private _init(): void {

        this._socket.on("connection", (socket: Socket) => {

            this._userManager.createUser({
                id: socket.id,
                username: socket.id,
                roomId: null
            });


            this._roomHandler.registerEvents();
            this._signalHandler.registerEvents();
        });


    }


}