import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { SheetManager } from 'react-native-actions-sheet';
import { io, Socket } from 'socket.io-client';
import { DisconnectDescription } from 'socket.io-client/build/esm/socket';

interface SocketIoContextType {
  socket: Socket | null;
  connected: boolean;
  error: Error | null;
}

export const SocketIoContext = createContext<SocketIoContextType>({
  socket: null,
  connected: false,
  error: null,
});

interface SocketIoProviderProps {
  children: React.ReactNode;
  city: string;
}

export function SocketIoProvider({ children, city }: SocketIoProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { error: pathError, errorTrigger } = useLocalSearchParams<{
    error?: string;
    errorTrigger?: string;
  }>();

  useEffect(() => {
    const newSocket = io(process.env.EXPO_PUBLIC_API_URL, { auth: { city } });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      newSocket.removeAllListeners();
    };
  }, [city]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const connectHandler = () => {
      setConnected(true);
      setError(null);

      // TODO: handle cases where the error sheet was shown by a different trigger
      SheetManager.hide('error-sheet');
    };
    socket.on('connect', connectHandler);

    const connectErrorHandler = (error: Error) => {
      setConnected(false);
      setError(error);

      console.error('connect_error', error);

      SheetManager.show('error-sheet', {
        payload: {
          error,
          trigger: 'socketIo',
          fatal: true,
        },
      });
    };
    socket.on('connect_error', connectErrorHandler);

    const disconnectHandler = (
      reason: Socket.DisconnectReason,
      description?: DisconnectDescription,
    ) => {
      setConnected(false);
      setError(new Error(reason));

      console.log('disconnect', reason, description);

      SheetManager.show('error-sheet', {
        payload: {
          error: new Error(reason),
          trigger: 'socketIo',
          fatal: true,
        },
      });
    };
    socket.on('disconnect', disconnectHandler);

    return () => {
      socket.off('connect', connectHandler);
      socket.off('connect_error', connectErrorHandler);
      socket.off('disconnect', disconnectHandler);
    };
  }, [errorTrigger, pathError, pathname, router, socket]);

  const contextValue = { socket, connected, error };

  return (
    <SocketIoContext.Provider value={contextValue}>
      {children}
    </SocketIoContext.Provider>
  );
}

export function useSocketIo() {
  return useContext(SocketIoContext);
}
