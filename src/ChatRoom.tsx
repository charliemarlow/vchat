
import { useState } from 'react';
import Messages from './Messages';

export default function ChatRoom({ userId, roomId }: { userId: number, roomId: number }) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, text: newMessage })
    };
    fetch('http://localhost:3000/rooms/1/messages', requestOptions)
      .then(response => response.json())
      .then(() => console.log('Message sent'));
    setNewMessage('');
  };

  return (
    <div className="chat-room">
      <Messages userId={userId} roomId={roomId} />
      <div>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
