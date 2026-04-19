import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { io, Socket } from "socket.io-client";
import { Device } from "mediasoup-client";
import { SOCKET_EVENTS } from "../constants/socket.events";

export const useBroadcast = () => {
    const { roomId } = useParams<{ roomId: string }>();

    const socketRef    = useRef<Socket | null>(null);
    const deviceRef    = useRef<Device | null>(null);
    const transportRef = useRef(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [usrRole, setUsrRole] = useState<'viewer' | 'host' | null>(null);


    const handleGetCapabilities = async (
        socket: Socket,
        roomId: string,
        role: 'host' | 'viewer',
        existingProducers
    ) => {
        socket.emit(SOCKET_EVENTS.BROADCAST_GET_CAPABILITIES, roomId, async (data) => {
            const device = new Device();

            await device.load({ routerRtpCapabilities: data.rtpCapabilities });

            deviceRef.current = device;
            console.log("device loaded !kdkd", data.rtpCapabilities);
            await handleCreateTransport(socket, roomId, role, existingProducers);
        });
    };


    const handleCreateTransport = async (
        socket: Socket,
        roomId: string,
        role: 'host' | 'viewer',
        existingProducers
    ) => {

        socket.emit(SOCKET_EVENTS.BROADCAST_CREATE_TRANSPORT, roomId, async (params) => {

            const device = deviceRef.current!;
            const transport = role === 'host'
                ? device.createSendTransport(params.params)
                : device.createRecvTransport(params.params);

            transportRef.current = transport;

            transport.on("connect", ({ dtlsParameters }, callback) => {
                socket.emit(SOCKET_EVENTS.BROADCAST_CONNECT_TRANSPORT, {roomId, dtlsParameters}, () => callback());
            });

            if (role === 'host') {
                await handleProduce(socket, roomId, transport);
            } else {
                await handleConsume(socket, roomId, existingProducers);
            }
        });
    };


    const handleProduce = async (
        socket: Socket,
        roomId: string,
        transport
    ) => {
        
        transport.on("produce", ({ kind, rtpParameters }, callback) => {
            socket.emit(
                SOCKET_EVENTS.BROADCAST_PRODUCE,
                { roomId, kind, rtpParameters },
                ({ id }) => callback({ id })
            );
        });

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

       if(localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play();
       }

        for (const track of stream.getTracks()) {
            await transport.produce({ track });
            console.log("producing:", track.kind);
        }
    };


    const handleConsume = async (
        socket: Socket,
        roomId: string,
        existingProducers: { producerId: string; kind: string }[]
    ) => {
        for (const { producerId } of existingProducers) {
            await consumeStream(socket, roomId, producerId);
        }

        // socket.on(SOCKET_EVENTS.BROADCAST_NEW_PRODUCER, async ({ producerId, kind }: any) => {
        //     await consumeStream(socket, roomId, producerId, kind);
        // });
    };


    const consumeStream = async (
        socket: Socket,
        roomId: string,
        producerId: string
        ) => {
        const device  = deviceRef.current!;
        const transport = transportRef.current!;

        socket.emit(
            SOCKET_EVENTS.BROADCAST_CONSUME,
            {
                roomId,
                producerId,
                rtpCapabilities: device.rtpCapabilities,
            },
            async (params) => {

                if(!params.ok){
                    console.log("consume error from server")
                    return;
                }

                const consumer = await transport.consume(params);

                socket.emit(SOCKET_EVENTS.BROADCAST_RESUME, {
                    roomId,
                    consumerId: consumer.id,
                });
            }
        );
    };




    useEffect(() => {
        if (!roomId) return;
        if (socketRef.current) return;

        const socket = io("http://localhost:3000");
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("connected:", socket.id);

            const username = prompt("Enter your username");

            socket.emit(SOCKET_EVENTS.JOIN_BROADCAST_ROOM, roomId, username, async (data: any) => {
                if (!data?.ok) return console.error(data.error);

                setUsrRole(data.role);
                setIsConnected(true);
                await handleGetCapabilities(socket, roomId, data.role, data.existingProducers);
            });
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [roomId]);


    return { isConnected, usrRole, localVideoRef };
};