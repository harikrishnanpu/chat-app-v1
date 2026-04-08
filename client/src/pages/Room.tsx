import { useEffect } from "react";
import { useParams } from "react-router";
import { io } from "socket.io-client";



export const Room = () => {

    const { username } = useParams();


    useEffect(()=> {
        const socket = io("http://localhost:3000");


        socket.on("connect", () => {
            console.log("connected to server");
        });
        socket.on("disconnect", () => {
            console.log("disconnected from server");
        });
    },[])

    return (
        <div>
            <h1>Chat Page</h1>
            <h2>Welcome {username}</h2>
        </div>
    )
}

