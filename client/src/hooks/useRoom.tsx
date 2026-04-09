import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../constants/socket.events";
import { useParams } from "react-router";



export const useRoom = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    const { roomId } = useParams();


    useEffect(() => {
        const socket = io("http://localhost:3000");


        socket.on("connect", () => {
            console.log("connected to server");
            socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId);
        });

        socket.on(SOCKET_EVENTS.ROOM_JOINED, ({roomId,
            isSDPOfferSent,
            user2Id,}) => {

            alert(`Room joined: ${roomId}
            isSDPOfferSent: ${isSDPOfferSent}
            user2Id: ${user2Id}`)
        });



        socket.on(SOCKET_EVENTS.LEAVE_ROOM, ({roomId}) => {
            alert(`Room left: ${roomId}`)
        });

        socket.on(SOCKET_EVENTS.ERROR, ({message}) => {
            alert(`Error: ${message}`)
        });


        socket.on("disconnect", () => {
            console.log("disconnected from server");
        });


        socket.on("send-offer", (message) => {
            console.log("send-offer", message);
        });

        socket.on("offer", (message) => {
            console.log("offer", message);
        });

        socket.on("answer", (message) => {
            console.log("answer", message);
        });

        // eslint-disable-next-line
        setSocket(socket);
    }, []);





    

    return { socket,  roomId };

}