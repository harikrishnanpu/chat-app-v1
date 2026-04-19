import { useBroadcast } from "../hooks/useBroadcast";



export const Broadcast = () => {

    const { isConnected, localVideoRef, usrRole, otherVideoRef } = useBroadcast();

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Broadcast</h1>
            <p className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Not Connected'}
                {usrRole}
            </p>
            <div id="remote-video">
                <video ref={localVideoRef} autoPlay playsInline muted ></video>
                <video ref={otherVideoRef} autoPlay playsInline muted ></video>
            </div>
        </div>
    )
}