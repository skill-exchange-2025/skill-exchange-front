import React, {useEffect} from 'react';
import {Outlet} from 'react-router-dom';
import {useGetChannelsQuery} from '../../redux/api/messagingApi';
import {useAppDispatch} from '../../redux/hooks';
import {setChannels, setError, setLoading,} from '../../redux/features/messaging/channelsSlice';
import socketService from '../../services/socket.service';

const MessagingLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useGetChannelsQuery({});

  useEffect(() => {
    // Initialize socket connection when component mounts
    socketService.connect();

    // Set up reconnection mechanism if connection drops
    const checkConnectionInterval = setInterval(() => {
      if (!socketService.isConnected()) {
        console.log('Socket connection check: Reconnecting...');
        socketService.connect();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      // Clean up on unmount
      clearInterval(checkConnectionInterval);
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    dispatch(setLoading({ type: 'channels', loading: isLoading }));

    if (error) {
      dispatch(setError(error.toString()));
    }

    if (data) {
      dispatch(setChannels(data.channels));
    }
  }, [data, isLoading, error, dispatch]);

  return (
    <div className="flex-1 h-[calc(100vh-160px)] bg-gray-100 dark:bg-gray-900">
      <Outlet />
    </div>
  );
};

export default MessagingLayout;
