import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppSelector} from '../../redux/hooks';
import ChannelSidebar from '../../components/messaging/ChannelSidebar';
import {MessageSquare} from 'lucide-react';
import {Button} from '../../components/ui/button';

const ChannelListPage: React.FC = () => {
  const navigate = useNavigate();
  const { channels, isLoadingChannels, lastSelectedChannelId } = useAppSelector(
    (state) => state.channels
  );

  // Redirect to saved channel if available, otherwise to the first channel
  useEffect(() => {
    if (!isLoadingChannels && channels.length > 0) {
      if (lastSelectedChannelId) {
        // Check if the saved channel still exists
        const savedChannel = channels.find(
          (c) => c._id === lastSelectedChannelId
        );
        if (savedChannel) {
          navigate(`/messaging/${lastSelectedChannelId}`);
          return;
        }
      }
      // If no saved channel or it doesn't exist anymore, navigate to the first channel
      navigate(`/messaging/${channels[0]._id}`);
    }
  }, [channels, isLoadingChannels, navigate, lastSelectedChannelId]);

  return (
    <>
      <ChannelSidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 text-center p-8">
        <MessageSquare
          size={64}
          className="text-gray-300 dark:text-gray-600 mb-6"
        />
        <h1 className="text-2xl font-bold mb-2">Welcome to Messaging</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
          Connect with others through channels. Share messages, files, and
          collaborate in real-time.
        </p>
        {isLoadingChannels ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        ) : channels.length === 0 ? (
          <Button
            onClick={() =>
              document
                .querySelector<HTMLButtonElement>('button:has(.lucide-plus)')
                ?.click()
            }
            className="font-medium"
          >
            Create Your First Channel
          </Button>
        ) : (
          <p className="text-sm text-gray-400">Loading your channels...</p>
        )}
      </div>
    </>
  );
};

export default ChannelListPage;
