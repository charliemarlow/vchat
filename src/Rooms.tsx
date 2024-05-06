import { useEffect, useState } from 'react';

export default function Rooms({ userId, setRoomId }: { userId: number, setRoomId: (roomId: number | null) => void}) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/rooms')
      .then((res) => res.json())
      .then((rooms) => {
        setRooms(rooms);
        setRoomId(rooms[0].id);
      });
  }, []);

  return (
    <div>
      {rooms.map((room) => (
        <div key={room.id}>
          <button onClick={() => setRoomId(room.id)}>Join</button>
          <div>{room.name}</div>
        </div>
      ))}
    </div>
  );
};
