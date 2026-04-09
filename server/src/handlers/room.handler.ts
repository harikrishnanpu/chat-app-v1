import { SOCKET_EVENTS } from "../contants/socket.events.constants";
import { IRoomHandler } from "../interfaces/IRoomHandler";
import { IRoomManager } from "../interfaces/IRoomManager";
import { IUserManager } from "../interfaces/IUserManager";
import { Socket } from "socket.io";



export class RoomHandler implements IRoomHandler { 

  constructor(
    private roomManager: IRoomManager,
    private userManager: IUserManager,
    private socket: Socket
  ){
    this.registerEvents();
  }


  registerEvents(): void {


    this.socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId: string) => {
      this.handleJoinRoom(roomId);
    });

    this.socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomId: string) => {
      this.handleLeaveRoom(roomId);
    });


  }


  private handleJoinRoom(roomId: string): void {

    const room =  this.roomManager.getRoom(roomId);

    if(!room) {
      this.roomManager.createRoom({
        id: roomId,
        userIds: [this.socket.id]
      });
      this.userManager.setRoom(this.socket.id, roomId);

      this.socket.join(roomId);

      this.socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
        roomId,
        isSDPOfferSent: false,
        user2Id: null,
    });

      return;
    }

    if(this.roomManager.isRoomFull(roomId)) {
      this.socket.emit(SOCKET_EVENTS.ERROR, "Room is full");
      return;
  }

    this.roomManager.joinRoom(roomId, this.socket.id);
    this.userManager.setRoom(this.socket.id, roomId);
    this.socket.join(roomId);

    const user2 = this.roomManager.getUser2(roomId, this.socket.id);
    
    this.socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
      roomId,
      isSDPOfferSent: true,
      user2Id: user2,
    });
  
    return;
  }


  private handleLeaveRoom(roomId: string): void {

    const user = this.userManager.getUser(this.socket.id);
    if (!user?.roomId) return;


    const room = this.roomManager.getRoom(roomId);

    if(!room) {
      return;
    }

    this.roomManager.leaveRoom(roomId, this.socket.id);
    this.userManager.setRoom(this.socket.id, null);
    this.socket.leave(roomId);

    const partener = this.roomManager.getUser2(roomId, this.socket.id);

    if(partener) {
      this.socket.to(partener).emit(SOCKET_EVENTS.LEAVE_ROOM, {
        roomId 
      });
    }

  }





}