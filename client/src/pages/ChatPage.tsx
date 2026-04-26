

import { useEffect, useRef, useState, type FormEvent } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../constants/socket.events";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
  username: string;
  createdAt: string;
};

export const Chat = () => {
  const socketRef = useRef<Socket | null>(null);

  const [username] = useState<string>(() => {
    const savedName = localStorage.getItem("chat-username");
    if (savedName) return savedName;

    const providedName = prompt("Enter chat username")?.trim();
    localStorage.setItem("chat-username", providedName);
    return providedName;
  });


  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    socketRef.current = socketInstance;

    socketInstance.on("connect", () => setIsConnected(true));
    socketInstance.on("disconnect", () => setIsConnected(false));

    socketInstance.on(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, (payload: ChatMessage) => {
      setMessages((prev) => [...prev, payload]);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!socketRef.current) return;

    socketRef.current.emit(SOCKET_EVENTS.CHAT_SEND_MESSAGE, {
      message: message.trim(),
      username: username.trim() || "Anonymous",
    });
    setMessage("");
  };

  return (
    <div className="mx-auto max-w-4xl h-screen p-4 pb-24">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <span className={`text-sm ${isConnected ? "text-green-600" : "text-red-500"}`}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div
        id="chats-messages"
        className="border border-gray-200 rounded-md h-[calc(100vh-180px)] overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">Send a message to start chatting with Ollama.</p>
        ) : (
          messages.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 rounded-md max-w-[80%] ${
                chat.role === "assistant"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-blue-600 text-white ml-auto"
              }`}
            >
              <p className="text-xs mb-1 opacity-80">{chat.username}</p>
              <p>{chat.message}</p>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex items-center gap-2"
        id="chats-input"
      >
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border border-gray-300 rounded-md p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-black text-white rounded-md p-2 px-4 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};