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
    <div className='flex-1 h-full w-full flex items-center justify-center bg-gray-100'>
      <form className='flex flex-col bg-white shadow-xl font-semibold border p-16 rounded-lg' onSubmit={(e) => handleSubmit(e)}>
        <p className='text-lg p-4'>
          Connect to the chat room 💬
        </p>
        <input className='p-2 my-2 text-lg border-2 text-gray-900 rounded border-blue-700' type='text' placeholder='Name' value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
        <input className='p-2 my-2 text-lg border-2 text-gray-900 rounded border-blue-700' type='text' placeholder='Room' value={roomInput} onChange={(e) => setRoomInput(e.target.value)} />
        <button className='mt-2 py-2 rounded bg-blue-700 text-lg text-white' type='submit'>Connect</button>
      </form>
    </div>
  )
}

export default Login