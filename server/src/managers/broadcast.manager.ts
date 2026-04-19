import { IBroadcastRoom, IBroadcastUser } from "@interfaces/IBroadcastRoom";
import { Router } from "mediasoup/node/lib/RouterTypes";




export class BroadcastManager { 
    
    private broadcast_rooms: Map<string, IBroadcastRoom>;

     constructor() {   
        this.broadcast_rooms = new Map();
    }

    createBroadcastRoom(roomId: string, router: Router): IBroadcastRoom {
        const broadcastRoom: IBroadcastRoom = {
            roomId,
            router,
            users: new Map<string, IBroadcastUser>(),
        };
        this.broadcast_rooms.set(roomId, broadcastRoom);
        return broadcastRoom;
    }



    joinBroadcastRoom(roomId: string, userId: string, username: string, role: 'host' | 'viewer', transport: any, producers: any[], consumers: any[]): void {
        const broadcastRoom = this.broadcast_rooms.get(roomId);
        if (broadcastRoom && !broadcastRoom.users.has(userId)) {
            broadcastRoom.users.set(userId, { id: userId, username: username, role: role, isEnabledToSpeak: role === 'host', transport: transport, producers: producers, consumers: consumers });
        }
    }



    leaveBroadcastRoom(userId: string) {
        let roomId = null;
        this.broadcast_rooms.forEach(room => {
            roomId = room.roomId;
            if(room.users.has(userId)) {
                room.users.delete(userId);
                if(room.users.size === 0) {
                    this.broadcast_rooms.delete(room.roomId);
                }
            }
        });

        return roomId;
    }



    getBroadcastRoom(userId: string): IBroadcastRoom | null {
        return this.broadcast_rooms.get(userId) || null;
    }

    getBroadcastRoomUsers(userId: string): IBroadcastUser[] {
        const broadcastRoom = this.broadcast_rooms.get(userId);
        if(!broadcastRoom) return [];
        return Array.from(broadcastRoom.users.values()).filter(user => user.role === 'viewer');
    }

    getProducers(userId: string): any[] {
        const broadcastRoom = this.broadcast_rooms.get(userId);
        if(!broadcastRoom) return [];
        return Array.from(broadcastRoom.users.values()).filter(user => user.isEnabledToSpeak ).map(user => user.producers);
    }
}