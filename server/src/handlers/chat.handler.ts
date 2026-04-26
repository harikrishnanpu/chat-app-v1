import { HumanMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../contants/socket.events.constants";

type ChatPayload = {
  message: string;
  username?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
  username: string;
  createdAt: string;
};

export class ChatHandler {
  private readonly _llm: any;

  constructor(
    private readonly _io: Server,
    private readonly _socket: Socket
  ) {
    this._llm = new ChatOllama({
      model: "llama3.2",
      baseUrl: "http://127.0.0.1:11434",
      temperature: 0.7,
    });

    this.registerEvents();
  }

  private registerEvents(): void {
    this._socket.on(
      SOCKET_EVENTS.CHAT_SEND_MESSAGE,
      async (payload: ChatPayload) => {
        await this.handleMessage(payload);
      }
    );
  }

  private buildMessage(
    role: "user" | "assistant",
    message: string,
    username: string
  ): ChatMessage {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      message,
      username,
      createdAt: new Date().toISOString(),
    };
  }

  private extractText(content: unknown): string {
    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === "string") return part;
          if (part && typeof part === "object" && "text" in part) {
            const maybeText = (part as { text?: unknown }).text;
            return typeof maybeText === "string" ? maybeText : "";
          }
          return "";
        })
        .join("")
        .trim();
    }

    return "";
  }

  private async handleMessage(payload: ChatPayload): Promise<void> {
    const input = payload.message?.trim();
    if (!input) return;

    const username = payload.username?.trim() ?? 'hari';
    const userMessage = this.buildMessage("user", input, username);
    this._io.emit(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, userMessage);

    console.log("message get:", userMessage)

    try {
      const response = await this._llm.invoke([
        new HumanMessage(
          `You are a helpful assistant in a realtime chat. Reply clearly and briefly.\nUser (${username}) says: ${input}`
        ),
      ]);

      console.log("llm:", response)
      const assistantText = this.extractText(response.content);


      const assistantMessage = this.buildMessage("assistant", assistantText, "Ollama");

      console.log("snsbbdbjd--", assistantMessage)
      this._io.emit(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, assistantMessage);

    } catch (error) {
      console.log(error);
    }
  }
}
