


export const SOCKET_EVENTS = {
    ROOM_JOINED: "room:joined",
    JOIN_ROOM: "room:join",
    LEAVE_ROOM: "room:leave",
    SEND_OFFER: "signal:send-offer",
    OFFER: "signal:offer",
    ANSWER: "signal:answer",
    ICE_CANDIDATE: "signal:ice-candidate",
    ERROR: "signal:error",

    CREATE_BROADCAST_ROOM: "broadcast:create-room",
    JOIN_BROADCAST_ROOM: "broadcast:join-room",
    LEAVE_BROADCAST_ROOM: "broadcast:leave-room",
    DEVICE_SETUP: "broadcast:device-setup",
    BROADCAST_GET_CAPABILITIES: "broadcast:get-capabilities",
    BROADCAST_CREATE_TRANSPORT: "broadcast:create-transport",
    BROADCAST_CONNECT_TRANSPORT: "broadcast:connect-transport",
    BROADCAST_PRODUCE: "broadcast:produce",
    BROADCAST_CONSUME: "broadcast:consume",
    BROADCAST_RESUME: "broadcast:resume",

    CHAT_SEND_MESSAGE: "chat:send-message",
    CHAT_MESSAGE_RECEIVED: "chat:message-received",
}   