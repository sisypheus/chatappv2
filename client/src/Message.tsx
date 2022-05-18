import React from 'react'

type Props = {
  message: any
}

const Message = ({ message }: Props) => {
  if (message.admin)
    return <div className='flex items-center justify-center'>
      <div className='px-4 py-2 bg-gray-200 rounded-md'>
        <p>{message.data}</p>
      </div>
    </div>
  else if (message.has_sent)
    return <div className='flex flex-col w-full items-end justify-end'>
      <div className='px-4 py-2 items-end bg-blue-500 rounded-md'>
        <p className='text-gray-100'>{message.data}</p>
      </div>
      <p>You</p>
    </div>
  else
    return <div className='flex flex-col w-full items-start justify-start'>
      <div className='px-4 py-2 items-end bg-gray-300 rounded-md'>
        <p>{message.data}</p>
      </div>
      <p>{message.name}</p>
    </div>
}

export default Message