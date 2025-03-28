import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useGetChannelsQuery } from '../../redux/api/messagingApi';
import { useAppDispatch } from '../../redux/hooks';
import {
  setChannels,
  setLoading,
  setError,
} from '../../redux/features/messaging/channelsSlice';
import socketService from '../../services/socket.service';

const MessagingLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useGetChannelsQuery({});

  useEffect(() => {
    // Connect to socket when component mounts
    socketService.connect();

    return () => {
      // Disconnect from socket when component unmounts
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
