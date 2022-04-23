import React, { useContext, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from './AppContext'

type Props = {}

const Login = () => {
  const { setName, name, setRoom, room } = useAppContext();
  const [nameInput, setNameInput] = React.useState<string>(name || '');
  const [roomInput, setRoomInput] = React.useState<string>(room || '');
  const nav = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setName(nameInput);
    setRoom(roomInput);
    nav('/' + roomInput + '?name=' + nameInput);
  }

  return (
    <div className='flex-1 h-full w-full items-center justify-center'>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type='text' placeholder='Name' value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
        <input type='text' placeholder='Room' value={roomInput} onChange={(e) => setRoomInput(e.target.value)} />
        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default Login