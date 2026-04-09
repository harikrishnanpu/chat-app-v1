

export interface IRoom {
  id: string;           
  userIds: string[]; 
}


export interface IRoomManager {
  createRoom(room: IRoom): IRoom;
  joinRoom(roomId: string, userId: string): void;
  getRoom(roomId: string): IRoom | null;
  leaveRoom(roomId: string, userId: string): void;
  getUser2(roomId: string, userId: string): string | null;
  isRoomFull(roomId: string): boolean;
}