import { Router, WebRtcTransport, Producer, Consumer } from 'mediasoup/node/lib/types';

export interface IBroadcastUser {
    id: string;
    username: string;
    role: 'host' | 'viewer';
    isEnabledToSpeak: boolean;
    transport: WebRtcTransport | null;
    producers: Producer[];
    consumers: Consumer[];
}

export interface IBroadcastRoom {
    roomId: string;
    router: Router;
    users: Map<string, IBroadcastUser>;     
}