import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppContext } from './AppContext';
import Message from './Message';

const Room = () => {
  const { room, socket, setRoom, setName } = useAppContext();
  let params = useParams();
  // eslint-disable-next-line 
  const [searchParams, _] = useSearchParams();
  const name = searchParams.get("name");
  const [message, setMessage] = React.useState<string>('');
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
  }, [messages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket) {
      if (!message) {
        return;
      }
      socket.send(message);
      const parsed = {
        has_sent: true,
        data: message
      }
      setMessages((currentMessages) => [...currentMessages, parsed]);
      setMessage('');
    }
  }

  return (
    <div className='h-full w-full bg-gray-100'>
      <div className='flex-1 bg-slate-50 h-full border border-b-0 shadow-lg sm:max-w-md m-auto w-full flex flex-col items-center justify-center'>
        <div className='flex items-center h-full justify-start flex-col flex-grow flex-shrink w-full'>
          <div className='p-1 w-full flex items-center border border-x-0 shadow-sm justify-center'>
            <p>{room}</p>
          </div>
          <div ref={scrollableRef} className='w-full basis-0 flex-grow flex-shrink flex-col overflow-auto px-2'>
            <div className='flex flex-col space-y-1'>
              {messages.map((message, index) => {
                return <Message key={index} message={message} />
              })}
            </div>
          </div>
        </div>
        <form className='w-full relative p-0' onSubmit={(e) => handleSubmit(e)}>
          <input className='w-full p-1 border-2 focus:outline-none border-gray-900 rounded' type='text' placeholder='Message' value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className='absolute border-2 px-2 py-1 border-gray-900 transform rounded -translate-x-full'>Send</button>
        </form>
      </div >
    </div>
  )
}

export default Room