import { useEffect, useRef } from "react";
import { useRoom } from "../hooks/useRoom";

export const Room = () => {
  const { socket, roomId, localStream, remoteStream, error } = useRoom();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = localVideoRef.current;
    if (el && localStream) {
      el.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (el && remoteStream) {
      el.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Room</h1>
        <p className="text-sm text-neutral-600">
          Room ID: <span className="font-mono">{roomId ?? "—"}</span>
          {socket?.id ? (
            <>
              {" "}
              · Socket: <span className="font-mono">{socket.id}</span>
            </>
          ) : null}
        </p>
        {error ? (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
      </header>

      <div className="grid flex-1 gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950">
          <p className="bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300">You</p>
          <video
            ref={localVideoRef}
            className="aspect-video w-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950">
          <p className="bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300">Remote</p>
          <video
            ref={remoteVideoRef}
            className="aspect-video w-full object-cover"
            autoPlay
            playsInline
          />
        </div>
      </div>
    </div>
  );
};
