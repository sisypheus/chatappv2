import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './AppContext';

const Login = () => {
  const { setName, name, setRoom, room } = useAppContext();
  const [nameInput, setNameInput] = React.useState<string>(name || '');
  const [roomInput, setRoomInput] = React.useState<string>(room || '');
  const nav = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nameInput && roomInput) {
      setName(nameInput);
      setRoom(roomInput);
      nav('/' + roomInput + '?name=' + nameInput);
    }
  }

  return (
    <div className='flex-1 h-full w-full flex items-center justify-center'>
      <form className='flex flex-col' onSubmit={(e) => handleSubmit(e)}>
        <input type='text' placeholder='Name' value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
        <input type='text' placeholder='Room' value={roomInput} onChange={(e) => setRoomInput(e.target.value)} />
        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default Login