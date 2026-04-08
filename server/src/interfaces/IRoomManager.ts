


export interface Room {
    id: string;
    userIds: string[];
  }
  


  export interface IRoomManager {
    createRoom(userId: string): Room;
    joinRoom(roomId: string, userId: string): Room | null;
    leaveRoom(roomId: string, userId: string): void;
    getRoom(roomId: string): Room | null;
    isFull(roomId: string): boolean;
  }