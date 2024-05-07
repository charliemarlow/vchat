import { useEffect, useState } from 'react';

export default function UsersInRoomSidebar({ userId, roomId }: { userId: number, roomId: number }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/rooms/${roomId}/users`)
      .then((res) => res.json())
      .then((users) => {
        setUsers(users);
      });
  }, []);

  const usersList = users.map((user: any) => {
    const status = user.id === userId ? 'online' : 'offline';
    const selected = user.id === userId ? 'selected' : '';
    return (
      <li key={user.id} className={`user ${selected}`}>
        {user.name}
        <div className={`user-status ${status}`}></div>
      </li>
    );
  });

  return (
    <div>
      <h1>Users in Room</h1>
      <ul>{usersList}</ul>
    </div>
  );
}
