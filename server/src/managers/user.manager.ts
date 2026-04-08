import { IUserManager, User } from "../interfaces/IUserManager";



export class UserManager implements IUserManager { 

    private readonly _users: Map<string, User>

    constructor (
    ){
        this._users = new Map();
    }

    public getUser(userId: string): User | null {
        console.log("getUser", userId);
        return this._users.get(userId) ?? null;
    }

    public createUser(socketId: string, username: string): User {
        const user: User = {
            id: socketId,
            username,
            roomId: null,
        };

        this._users.set(socketId, user);
        console.log("user added", user);
        return user;
    }

    public removeUser(userId: string): void {
        this._users.delete(userId);
        console.log("user removed", userId);
    }


}