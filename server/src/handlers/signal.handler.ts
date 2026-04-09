import { Socket } from "socket.io";
import { ISignalHandler } from "../interfaces/ISignalHandler";
import { IRoomManager } from "../interfaces/IRoomManager";
import { SOCKET_EVENTS } from "../contants/socket.events.constants";


interface IOffer {
    roomId: string;
    sdp: RTCSessionDescriptionInit;
}


export class SignalHandler implements ISignalHandler { 

    constructor(
        private _socket: Socket,
        private _roomManager: IRoomManager,
    ){}


    registerEvents(): void {

        this._socket.on(SOCKET_EVENTS.SEND_OFFER, (offer: IOffer) => {
            this.handleOffer(offer);
        });

        this._socket.on(SOCKET_EVENTS.ANSWER, (answer: IOffer) => {
            this.handleAnswer(answer);
        });


    }



    private handleOffer(offer: IOffer): void {
        const room = this._roomManager.getRoom(offer.roomId);
        if(!room) return;

        const partnerUser = this._roomManager.getUser2(offer.roomId, this._socket.id);
        if(!partnerUser) return;

        this._socket.to(partnerUser).emit(SOCKET_EVENTS.OFFER, offer);
    }


    private handleAnswer(answer: IOffer): void {
        const room = this._roomManager.getRoom(answer.roomId);
        if(!room) return;

        const partnerUser = this._roomManager.getUser2(answer.roomId, this._socket.id);
        if(!partnerUser) return;

        this._socket.to(partnerUser).emit(SOCKET_EVENTS.ANSWER, answer);
    }




}