import { useRoom } from "../hooks/useRoom";



export const Room = () => {


    const { socket, roomId } = useRoom();

    return (
        <div>
            <h1>Chat Page</h1>
            <h2>Welcome {roomId}</h2>
            <p>{socket?.id}</p>
        </div>
    )
}

