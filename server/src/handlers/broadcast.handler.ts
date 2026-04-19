import { MediaKind } from "mediasoup/node/lib/types";
import { SOCKET_EVENTS } from "../contants/socket.events.constants";
import { BroadcastManager } from "../managers/broadcast.manager";
import { MediasoupManager } from "../managers/mediaSoupmanager";
import { Socket } from "socket.io";



export class BroadcastHandler {

    private _broadcastManager: BroadcastManager;
    private _mediasoupManager: MediasoupManager;
    private _socket: Socket;

    
    constructor(broadcastManager: BroadcastManager, mediasoupManager: MediasoupManager, socket: Socket) {
        this._mediasoupManager = mediasoupManager;
        this._broadcastManager = broadcastManager;
        this._socket = socket;

        console.log('Broadcast handler initialized');
        this.registerEvents();
    }

    private registerEvents(): void {

        this._socket.on(SOCKET_EVENTS.JOIN_BROADCAST_ROOM, async (roomId: string, username: string, callback : (data: any) => {}) => {
            console.log('Join brdcast room: ', roomId, username);
            await this.joinBroadcastRoom(roomId, username, callback);
        });

        this._socket.on(SOCKET_EVENTS.BROADCAST_GET_CAPABILITIES, async (roomId: string, callback : (data: any) => {}) => {
            console.log('Get capabilities: ', roomId);
            await this.getCapabilities(roomId, callback);
        });

        this._socket.on(SOCKET_EVENTS.BROADCAST_CREATE_TRANSPORT, async (roomId: string, callback : (data: any) => {}) => {
            console.log('Create transport: ', roomId);
            await this.createTransport(roomId, callback);
        });

        this._socket.on(SOCKET_EVENTS.BROADCAST_CONNECT_TRANSPORT, async ({roomId, dtlsParameters}: {roomId: string, dtlsParameters: any}, callback : (data: any) => {}) => {
            console.log('Connect transport: ', roomId);
            await this.connectTransport({roomId, dtlsParameters}, callback);
        });

        this._socket.on(SOCKET_EVENTS.BROADCAST_PRODUCE, async ({roomId, kind, rtpParameters}: {roomId: string, kind: string, rtpParameters: any}, callback : (data: any) => {}) => {
            console.log('Produce: ', roomId, kind, rtpParameters);
            await this.produce({roomId, kind, rtpParameters}, callback);
        });

        this._socket.on(SOCKET_EVENTS.BROADCAST_CONSUME, async ({roomId, producerId, rtpCapabilities}: {roomId: string, producerId: string, rtpCapabilities: any}, callback : (data: any) => {}) => {
            console.log('Consume: ', roomId, producerId, rtpCapabilities);
            await this.consume({roomId, producerId, rtpCapabilities}, callback);
        });

        this._socket.on(SOCKET_EVENTS.BROADCAST_RESUME, async ({roomId, consumerId}: {roomId: string, consumerId: string}, callback : (data: any) => {}) => {
            console.log('Resume: ', roomId, consumerId);
            await this.resume({roomId, consumerId}, callback);
        });

    }

    async joinBroadcastRoom( roomId: string, username: string, callback : (data: any) => {}): Promise<void> {


        let broadcastRoom = this._broadcastManager.getBroadcastRoom(roomId);

        if (!broadcastRoom) {
            console.log('Broadcast room not found,creating....');

            const router = await this._mediasoupManager.createRouter();
            this._broadcastManager.createBroadcastRoom(roomId, router);


            broadcastRoom = this._broadcastManager.getBroadcastRoom(roomId);

            }

            if(!broadcastRoom) {

                console.log('Broadcast room not found, returning error');

                callback({
                    ok: false,
                    message: 'Broadcast room not found'
                });
                return;
            }

            const transport = await this._mediasoupManager.createTransport(broadcastRoom.router);
            const producers = this._broadcastManager.getProducers(roomId);

            // console.log('Producers: ', producers);

            console.log('Broadcast room users: ', broadcastRoom.users.size);

            let isHost = false;

            if(broadcastRoom.users.size === 0) {
                isHost = true;
            }

            this._broadcastManager.joinBroadcastRoom(roomId, this._socket.id, username, isHost ? 'host' : 'viewer', transport, producers, []);
            this._socket.join(roomId);

            callback({ 
                ok: true, 
                role: isHost ? 'host' : 'viewer',
                roomId,
                existingProducers: producers,
                rtpCapabilities: broadcastRoom.router.rtpCapabilities
            });





    }



    async leaveBroadcastRoom(): Promise<void> {
        const roomId = this._broadcastManager.leaveBroadcastRoom(this._socket.id);
        if(roomId) {
            this._socket.leave(roomId);
        }
    }


    async getCapabilities(roomId: string, callback : (data: any) => {}): Promise<void> {
        const broadcastRoom = this._broadcastManager.getBroadcastRoom(roomId);

        if(!broadcastRoom) {
            callback({
                ok: false,
                message: 'Broadcast room not found'
            });
            return;
        }

        callback({
            ok: true,
            rtpCapabilities: broadcastRoom.router.rtpCapabilities
        });
    }


    async createTransport(roomId: string, callback : (data: any) => {}): Promise<void> {
        const broadcastRoom = this._broadcastManager.getBroadcastRoom(roomId);

        if(!broadcastRoom) {
            callback({
                ok: false,
                message: 'Broadcast room not found'
            });
            return;
        }

        const transport = await this._mediasoupManager.createTransport(broadcastRoom.router);
        callback({
            ok: true,
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
              }
        });
    }



    async connectTransport({roomId, dtlsParameters}: {roomId: string, dtlsParameters: any}, callback : (data: any) => {}): Promise<void> {
        const broadcastRoom = this._broadcastManager.getBroadcastRoom(roomId);
        if(!broadcastRoom) {
            callback({
                ok: false,
                message: 'Broadcast room not found'
            });
            return;
        }

        const transport = broadcastRoom.users.get(this._socket.id)?.transport;
        if(!transport) {
            callback({
                ok: false,
                message: 'Transport not found'
            });
            return;
        }


        transport.connect(dtlsParameters);
        callback({
            ok: true,
            id: transport.id
        });
    }


    async produce({roomId, kind, rtpParameters}: {roomId: string, kind: string, rtpParameters: any}, callback : (data: any) => {}): Promise<void> {
        const broadcastRoom = this._broadcastManager.getBroadcastRoom(roomId);
        if(!broadcastRoom) {
            callback({
                ok: false,
                message: 'Broadcast room not found'
            });
            return;
        }

        const transport = broadcastRoom.users.get(this._socket.id)?.transport;

        if(!transport) {
            callback({
                ok: false,
                message: 'Transport not found'
            });
            return;
        }



        const producer = await transport.produce({ kind: kind as MediaKind, rtpParameters });
        callback({
            ok: true,
            id: producer.id
        });
    }



    async consume({roomId, producerId, rtpCapabilities}: {roomId: string, producerId: string, rtpCapabilities: any}, callback : (data: any) => {}): Promise<void> {
        const broadcastRoom = this._broadcastManager.getBroadcastRoom(roomId);
        if(!broadcastRoom) {
            callback({
                ok: false,
                message: 'Broadcast room not found'
            });
            return;
        }

        const transport = broadcastRoom.users.get(this._socket.id)?.transport;
        if(!transport) {
            callback({
                ok: false,
                message: 'Transport not found'
            });
            return;
        }

        const consumer = await transport.consume({ producerId, rtpCapabilities });

        callback({
            ok: true,
            id: consumer.id
        });
    }


    async resume({roomId, consumerId}: {roomId: string, consumerId: string}, callback : (data: any) => {}): Promise<void> {
        const broadcastRoom = this._broadcastManager.getBroadcastRoom(roomId);
        if(!broadcastRoom) {
            callback({
                ok: false,
                message: 'Broadcast room not found'
            });
            return;
        }

        const consumer = broadcastRoom.users.get(this._socket.id)?.consumers.find((consumer) => consumer.id === consumerId);

        if(!consumer) {
            callback({
                ok: false,
                message: 'Consumer not found'
            });
            return;
        }

        consumer.resume();
        callback({
            ok: true,
            id: consumer.id
        });
    }





}