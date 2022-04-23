import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useAppContext } from './AppContext';

type Props = {}

const Room = (props: Props) => {
  const { name, room, socket, setRoom, setName } = useAppContext();
  let params = useParams();
  const [message, setMessage] = React.useState<string>('');

  useEffect(() => {
    if (!room && params.room) {
      console.log(room);
      setRoom(params.room);
      // setName(params.name)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket) {
      socket.send(message);
      setMessage('');
    }
  }

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type='text' placeholder='message' value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}

export default Room