import * as mediasoup from 'mediasoup';
import { Router } from 'mediasoup/node/lib/RouterTypes';
import { Worker } from 'mediasoup/node/lib/WorkerTypes';
import { WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransportTypes';

const MEDIA_CODECS: any = [
    { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
    { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 },
  ];

const TRANSPORT_OPTIONS: mediasoup.types.WebRtcTransportOptions = {
    listenInfos: [{ protocol: 'udp', ip: '0.0.0.0', announcedAddress: '127.0.0.1' }],
    enableUdp: true,
    enableTcp: true,
};

export class MediasoupManager {

    private static _instance: MediasoupManager;

    private _worker!: Worker;

    private constructor() {
        //async constructor
    }

    public static getInstance(): MediasoupManager {
        if (!MediasoupManager._instance) {
            MediasoupManager._instance = new MediasoupManager();
        }
        return MediasoupManager._instance;
    }

    async init(): Promise<void> {
        this._worker = await mediasoup.createWorker({ logLevel: 'warn' });

        console.log('MediasoupManager ready');
    }

    async createRouter(): Promise<Router> {
        return this._worker.createRouter({ mediaCodecs: MEDIA_CODECS });
    }

    async createTransport(router: Router): Promise<WebRtcTransport> {
        return router.createWebRtcTransport(TRANSPORT_OPTIONS);
    }
}