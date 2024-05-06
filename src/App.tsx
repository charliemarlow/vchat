import { useState } from 'react';
import Messages from './Messages';
import Rooms from './Rooms';

function App() {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState<number | null>(null);
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

  const handleJoin = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username })
    };
    fetch('http://localhost:3000/users', requestOptions)
      .then(response => response.json())
      .then((data) => {
        console.log('User ID:', data.id);
        setUserId(data.id);
      });
  }

  if (!userId) {
    return (
      <div>
        <input
          type="text"
          placeholder="Enter your username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          type="button"
          onClick={handleJoin}
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <Rooms userId={userId} setRoomId={setRoomId} />
      <Messages userId={userId} />
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
  )
}

export default App
