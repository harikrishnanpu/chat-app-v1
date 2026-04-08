


export interface User {
    id: string;
    username: string;
    roomId: string | null;
}

export interface IUserManager {
    getUser(userId: string): User | null;
    createUser(socketId: string, username: string): User;
    removeUser(userId: string): void;
}