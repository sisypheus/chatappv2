import React, { useEffect } from 'react'

interface AppContextType {
  name?: string
  room?: string
  socket?: WebSocket
  setName: (name: string) => void
  setRoom: (room: string) => void
}

const AppContext = React.createContext<AppContextType>({} as AppContextType);

type Props = {
  children: React.ReactNode
}

export const useAppContext = () => React.useContext(AppContext);

const AppContextProvider = ({ children }: Props) => {
  const [name, setName] = React.useState<string>('');
  const [socket, setSocket] = React.useState<WebSocket>();
  const [room, setRoom] = React.useState<string>('');

  useEffect(() => {
    if (room && name) {
      const socket = new WebSocket((process.env.REACT_APP_SOCKET_URL || 'ws://localhost:8080/') + room + "?name=" + name);
      socket.onopen = () => {
        setSocket(socket);
      }
    }
  }, [room, name]);

  return (
    <AppContext.Provider value={{ name, socket, room, setName, setRoom }}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider