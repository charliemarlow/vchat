import { useEffect, useState } from 'react';

export default function RoomsSidebar(
  { userId, setRoomId }:
  { userId: number, setRoomId: (roomId: number | null) => void },
) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/rooms')
      .then((res) => res.json())
      .then((rooms) => {
        setRooms(rooms);
        setRoomId(rooms[0].id);
      });
  }, []);

  const roomsList = rooms.map((room: any) => {
    const selected = room.id === userId ? 'selected' : '';
    return (
      <li
        key={room.id}
        onClick={() => {
          console.log('Room selected:', room.id);
          setRoomId(room.id);
        }}
        className={`room ${selected}`}
       >
        {room.name}
      </li>
    );
  });

  return (
    <div>
      <h1>Chat rooms</h1>
      <ul>{roomsList}</ul>
    </div>
  );
};
