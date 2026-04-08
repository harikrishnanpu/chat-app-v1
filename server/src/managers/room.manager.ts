import { IRoomManager, Room } from "../interfaces/IRoomManager";



export class RoomManager implements IRoomManager { 

    private readonly _rooms: Map<string, Room>

    constructor(
    ){
        this._rooms = new Map();
    }

    private generateId(): string {
        return Math.floor(Math.random() * 1000).toString();
    }


    public createRoom(userId: string): Room {
        const room = {
            id: this.generateId(),
            userIds: [userId],
        };
        this._rooms.set(room.id, room);
        return room;
    }


    public joinRoom(roomId: string, userId: string): Room | null {
        const room = this._rooms.get(roomId);
        if (!room) {
            return null;
        }
        room.userIds.push(userId);
        return room;
    }


    public leaveRoom(roomId: string, userId: string): void {
        const room = this._rooms.get(roomId);
        if (!room) {
            return;
        }
        room.userIds = room.userIds.filter(id => id !== userId);
        if (room.userIds.length === 0) {
            this._rooms.delete(roomId);
        }
    }

    public getRoom(roomId: string): Room | null {
        return this._rooms.get(roomId) ?? null;
    }

    
    public isFull(roomId: string): boolean {
        const room = this._rooms.get(roomId);
        if (!room) {
            return false;
        }
        return room.userIds.length >= 2;
    }



}