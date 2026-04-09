import { IRoom, IRoomManager } from "../interfaces/IRoomManager";



const MAX_USERS_PER_ROOM = 2;


export class RoomManager implements IRoomManager  {

    private _rooms: Map<string, IRoom>;


    constructor() {
        this._rooms = new Map();
    }

    createRoom(room: IRoom): IRoom {
        this._rooms.set(room.id, room);
        return room;    
    }

    joinRoom(roomId: string, userId: string): void {
        console.log("Joinroom: ", roomId)
        const room = this._rooms.get(roomId);
        if (room) {
            room.userIds.push(userId);
        }
    }
    
        getRoom(roomId: string): IRoom | null {
            return this._rooms.get(roomId) ?? null;
        }




    leaveRoom(roomId: string, userId: string): void {
        const room = this._rooms.get(roomId);
        if (room) {
            room.userIds = room.userIds.filter(id => id !== userId);
        }
    }


    getUser2(roomId: string, userId: string): string | null {
        const room = this._rooms.get(roomId);
        if (room) {
            return room.userIds.find(id => id !== userId) ?? null;
        }
        return null;
    }

    isRoomFull(roomId: string): boolean {
        const room = this._rooms.get(roomId);
        if (room) {
            return room.userIds.length >= MAX_USERS_PER_ROOM;
        }
        return false;
    }


}