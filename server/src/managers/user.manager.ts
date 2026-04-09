import { IUser, IUserManager } from "../interfaces/IUserManager";



export class UserManager implements IUserManager {

    private _users: Map<string, IUser>;


    constructor() {

        this._users = new Map();
        
    }
    
    
    createUser(user: IUser): IUser {
        console.log(this._users)
        this._users.set(user.id, user);
        return user;
    }

    removeUser(userId: string): void {
        this._users.delete(userId);
    }

    getUser(userId: string): IUser | null {
        return this._users.get(userId) ?? null;
    }

    setRoom(userId: string, roomId: string | null): void {
        const user = this.getUser(userId);
        if (user) {
            user.roomId = roomId;
        }
    }

}