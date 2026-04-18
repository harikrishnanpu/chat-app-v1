import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../constants/socket.events";
import { useParams } from "react-router";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

type RoomJoinedPayload = {
  roomId: string;
  isSDPOfferSent: boolean;
  user2Id: string | null;
};

type SignalSdpPayload = {
  roomId: string;
  sdp: RTCSessionDescriptionInit;
};

type IcePayload = {
  roomId: string;
  candidate: RTCIceCandidateInit | null;
};

export const useRoom = () => {
  const { roomId } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    if (!roomId) return;

    let active = true;
    let socketInstance: Socket | null = null;

    const flushPendingIce = async (pc: RTCPeerConnection) => {
      const pending = pendingIceRef.current.splice(0);
      for (const c of pending) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {
          console.log("jkenjbjenfjner")
        }
      }
    };

    const addIceOrQueue = async (pc: RTCPeerConnection | null, candidate: RTCIceCandidateInit | null) => {
      if (!candidate || !pc) return;
      if (!pc.remoteDescription) {
        pendingIceRef.current.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        pendingIceRef.current.push(candidate);
      }
    };

    const ensurePc = (stream: MediaStream, emitIce: (c: RTCIceCandidate) => void) => {
      if (pcRef.current) return pcRef.current;
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
      }

      pc.ontrack = (ev) => {
        const [remote] = ev.streams;
        if (remote && active) setRemoteStream(remote);
      };

      pc.onicecandidate = (ev) => {
        if (ev.candidate) emitIce(ev.candidate);
      };

      return pc;
    };

    void (async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Could not access camera or microphone");
        }
        return;
      }

      if (!active) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      socketInstance = io(SOCKET_URL);

      if (!active) {
        socketInstance.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      setSocket(socketInstance);

      const emitIce = (candidate: RTCIceCandidate) => {
        socketInstance?.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
          roomId,
          candidate: candidate.toJSON(),
        });
      };

      const joinRoom = () => {
        socketInstance?.emit(SOCKET_EVENTS.JOIN_ROOM, roomId);
      };

      socketInstance.on("connect", joinRoom);
      if (socketInstance.connected) joinRoom();

      socketInstance.on(SOCKET_EVENTS.ROOM_JOINED, async (payload: RoomJoinedPayload) => {
        if (!active || payload.roomId !== roomId) return;
        const pc = ensurePc(stream, emitIce);

        if (payload.isSDPOfferSent) {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketInstance?.emit(SOCKET_EVENTS.SEND_OFFER, {
              roomId,
              sdp: pc.localDescription!.toJSON(),
            });
          } catch {
            if (active) setError("Failed to start the call");
          }
        }
      });

      socketInstance.on(SOCKET_EVENTS.OFFER, async (msg: SignalSdpPayload) => {
        if (!active || msg.roomId !== roomId) return;
        const pc = ensurePc(stream, emitIce);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          await flushPendingIce(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketInstance?.emit(SOCKET_EVENTS.ANSWER, {
            roomId,
            sdp: pc.localDescription!.toJSON(),
          });
        } catch {
          if (active) setError("Failed to answer the call");
        }
      });

      socketInstance.on(SOCKET_EVENTS.ANSWER, async (msg: SignalSdpPayload) => {
        if (!active || msg.roomId !== roomId) return;
        const pc = pcRef.current;
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          await flushPendingIce(pc);
        } catch {
          if (active) setError("Failed to complete the connection");
        }
      });

      socketInstance.on(SOCKET_EVENTS.ICE_CANDIDATE, async (msg: IcePayload) => {
        if (!active || msg.roomId !== roomId) return;
        await addIceOrQueue(pcRef.current, msg.candidate);
      });

      socketInstance.on(SOCKET_EVENTS.ERROR, (payload: { message: string }) => {
        if (active) setError(payload.message);
      });

      socketInstance.on(SOCKET_EVENTS.LEAVE_ROOM, () => {
        if (!active) return;
        pendingIceRef.current = [];
        pcRef.current?.close();
        pcRef.current = null;
        setRemoteStream(null);
      });
    })();

    return () => {
      active = false;
      pendingIceRef.current = [];
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;

      if (socketInstance) {
        socketInstance.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId);
        socketInstance.disconnect();
      }

      setSocket(null);
      setLocalStream(null);
      setRemoteStream(null);
    };
  }, [roomId]);

  return { socket, roomId, localStream, remoteStream, error };
};
