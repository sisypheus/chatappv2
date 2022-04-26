import React, { useEffect, useRef } from 'react';
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
  const [messages, setMessages] = React.useState<any[]>([]);
  const scrollableRef = useRef<HTMLInputElement>(null);

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
      const parse = JSON.parse(e.data);
      setMessages((currentMessages) => [...currentMessages, parse]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  useEffect(() => {
    if (!scrollableRef.current)
      return
    scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket) {
      if (!message) {
        setError('Cannot send empty message');
        return;
      }
      error && setError('');
      socket.send(message);
      const parsed = {
        has_sent: true,
        data: message
      }
      setMessages((currentMessages) => [...currentMessages, parsed]);
      setMessage('');
    } else {
      setError('Not connected to socket.');
    }
  }

  return (
    <div className='flex-1 bg-slate-50 h-full max-w-md py-12 px-2 m-auto w-full flex flex-col items-center justify-center'>
      <div className='flex items-center h-full justify-start flex-col w-full my-2'>
        <div ref={scrollableRef} className='w-full flex-col overflow-auto'>
          <div className='flex flex-col'>
            {messages.map((message, index) => {
              // TODO - make this a component
              if (message.admin)
                return <div className='flex items-center justify-center' key={index}>
                  <div className='px-4 py-2 bg-gray-200 rounded-md'>
                    <p>{message.data}</p>
                  </div>
                </div>
              else if (message.has_sent)
                return <div className='flex w-full items-end justify-end' key={index}>
                  <div className='px-4 py-2 items-end bg-blue-500 rounded-md'>
                    <p className='text-gray-100'>{message.data}</p>
                  </div>
                </div>
              else
                return <div className='flex w-full items-start justify-start' key={index}>
                  <div className='px-4 py-2 items-end bg-gray-300 rounded-md'>
                    <p>{message.data}</p>
                  </div>
                </div>
            })}
          </div>
        </div>
      </div>
      <form className='w-full relative' onSubmit={(e) => handleSubmit(e)}>
        <input className='w-full p-1 border-2 focus:outline-none border-gray-900 rounded' type='text' placeholder='Message' value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className='absolute border-2 px-2 py-1 border-gray-900 transform rounded -translate-x-full'>Send</button>
      </form>
      {
        error && (
          <div className='text-red-500'>{error}</div>
        )
      }
    </div >
  )
}

export default Room