// src/hooks/useGrokChat.ts
import { useState, useEffect, useRef, useCallback } from "react";

export type Message = {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  time: number;
};

type UseGrokChatProps = {
  backendUrl: string;
};

export const useGrokChat = ({ backendUrl }: UseGrokChatProps) => {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      sender: "system",
      text: "Hi! Type a question to chat with our AI agent, or use the contact form.",
      time: Date.now(),
    },
  ]);
  const [connected, setConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sending, _ ] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const pushMessage = useCallback((m: Message) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  // Connect WebSocket
  useEffect(() => {
    const wsUrl = backendUrl.replace(/^http/, "ws").replace(/\/$/, "") + "/ws/support";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "init", payload: { project: "flowcart" } }));
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data?.type === "ai_message" && data.text) {
          pushMessage({
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.text,
            time: Date.now(),
          });
        }
      } catch (err) {
        console.warn("WS parse error:", err);
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = (err) => console.error("WS error:", err);

    return () => ws.close();
  }, [backendUrl, pushMessage]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text, time: Date.now() };
    pushMessage(userMsg);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "user_message", payload: { text } }));
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "system",
        text: "Chat cleared. Ask a question or use the form to contact us.",
        time: Date.now(),
      },
    ]);
  };

  return { messages, connected, sending, sendMessage, clearChat };
};
