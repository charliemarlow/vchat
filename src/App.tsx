import { useState } from 'react';
import ChatRoom from './ChatRoom';
import RoomsSidebar from './RoomsSidebar';
import UsersInRoomSidebar from './UsersInRoomSidebar';

function App() {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState<number | null>(null);

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
      <form>
        <label>
          Enter your username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={handleJoin}
        >
          Join
        </button>
      </form>
    );
  }

  return (
    <div className="chat-container">
      <RoomsSidebar userId={userId} setRoomId={setRoomId} />
      {roomId && <ChatRoom userId={userId} roomId={roomId} />}
      {roomId && <UsersInRoomSidebar userId={userId} roomId={roomId} />}
    </div>
  )
}

export default App
