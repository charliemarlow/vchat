import { useEffect, useRef, useState } from 'react';
import timeAgo from './timeAgo';

const WEBSOCKET_URL = 'ws://localhost:8080';

type Message = {
  id: number;
  userId: number;
  text: string;
  createdAt: string;
};

function ChatBubble ({
  currentUserId,
  message,
}: { currentUserId: number, message: Message }) {
  console.log('message', message);
  const chatType = message.userId === currentUserId ? 'chat-end' : 'chat-start';
  const messageTime = timeAgo.format(new Date(message.createdAt));
  return (
    <>
      <div className={`chat-bubble ${chatType}`}>
        <div className="chat-header">
          {message.userId}
          {' '}
          {messageTime}
        </div>
        <div>{message.text}</div>
      </div>
    </>
  );
}

export default function Messages({ userId, roomId }: { userId: number, roomId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUserId = userId;

  const [isReady, setIsReady] = useState(false);

  const socket = useRef<WebSocket | null>(null);

  const setupWebSocket = () => {
    try {
      const ws = new WebSocket(WEBSOCKET_URL + '/' + currentUserId);

      ws.addEventListener('open', () => {
        console.log('Connected to server');
        setIsReady(true);
      });

      ws.addEventListener('error', (error) => {
        console.error('Socket closed with error:', error);
        setIsReady(false);
      });

      ws.addEventListener('close', () => {
        setIsReady(false);
      });

      ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        setMessages((messages) => {
          if (messages.some((m) => m.id === message.id)) {
            return messages;
          }
          return [...messages, message];
        });
      });

      socket.current = ws;
    } catch (error) {
      console.error('Unable to connect:', error);
    }
  };

  const loadMessages = async () => {
    const response = await fetch(`http://localhost:3000/rooms/${roomId}/messages`);
    const data = await response.json();
    // only show most recent 4 messages
    setMessages(data);
  };

  useEffect(() => {
    setupWebSocket();
    loadMessages();

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  if (!isReady) {
    return <div>Connecting...</div>;
  }

  return (
    <>
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} currentUserId={currentUserId} />
      ))}
    </>
  );
};
