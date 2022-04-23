import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppContext } from './AppContext';

const Room = () => {
  const { room, socket, setRoom, setName } = useAppContext();
  let params = useParams();
  // eslint-disable-next-line 
  const [searchParams, _] = useSearchParams();
  const name = searchParams.get("name");
  const [message, setMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [messages, setMessages] = React.useState<string[]>([]);

  useEffect(() => {
    if (!room && params.room && name) {
      setRoom(params.room);
      setName(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!socket)
      return
    socket.onmessage = (e) => {
      setMessages((currentMessages) => [...currentMessages, e.data]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket) {
      if (!message) {
        setError('Cannot send empty message');
        return;
      }
      error && setError('');
      socket.send(message);
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessage('');
    } else {
      setError('Not connected to socket.');
    }
  }

  return (
    <div className='flex-1 h-full max-w-md py-12 m-auto w-full flex flex-col items-center justify-center'>
      <div className='flex-col'>
        {messages.map((message, index) => <div key={index}>{message}</div>)}
      </div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type='text' placeholder='message' value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type='submit'>Send</button>
      </form>
      {error && (
        <div className='text-red-500'>{error}</div>
      )}
    </div>
  )
}

export default Room