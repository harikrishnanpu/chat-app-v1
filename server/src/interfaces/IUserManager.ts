export interface IUser {
    id: string;      
    username: string;
    roomId: string | null;
}


export interface IUserManager {
    createUser(user: IUser): IUser;
    removeUser(userId: string): void;
    getUser(userId: string): IUser | null;
    setRoom(userId: string, roomId: string | null): void;
}

