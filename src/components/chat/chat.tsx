import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

interface User {
  _id: string;
  name: string;
  email: string;
  // Add other properties you want to use
}

const ChatApp: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [chat, setChat] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Update to use User type
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Track selected user as an object

  useEffect(() => {
    socket = io('http://localhost:5000'); // Your NestJS backend with WebSocket
  
    socket.on('message', (msg: string) => {
      if (selectedUser) {
        setChat((prevChat) => [...prevChat, msg]);
      }
    });
  
    socket.on('user-joined', (data: { message: string }) => {
      setChat((prevChat) => [...prevChat, `🔵 ${data.message}`]);
    });
  
    socket.on('user-left', (data: { message: string }) => {
      setChat((prevChat) => [...prevChat, `🔴 ${data.message}`]);
    });
  
    return () => {
      socket.disconnect();
    };
  }, [selectedUser]); // Re-run effect when selectedUser changes
  

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5000/api/auth/getAllUsers');
    const data = await response.json();
    setUsers(data.data); // Assuming the response contains users in the "data" field
  };

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      socket.emit('newM', { message, user: selectedUser._id });
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3>Users</h3>
        <div style={styles.userList}>
          {users.map((user) => (
            <div
              key={user._id} // Use unique _id for the key
              style={styles.userItem}
              onClick={() => setSelectedUser(user)} // Set the whole user object
            >
              {user.name} {/* Display the user's name */}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.chatBoxContainer}>
        <h2 style={styles.heading}>💬 Chat with {selectedUser ? selectedUser.name : 'Select a user'}</h2>
        <div style={styles.chatBox}>
          {chat.map((msg, index) => (
            <div key={index} style={styles.messageBubble}>
              {msg}
            </div>
          ))}
        </div>
        {selectedUser && (
          <form onSubmit={sendMessage} style={styles.form}>
            <input
              type="text"
              value={message}
              placeholder="Type your message..."
              onChange={(e) => setMessage(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    maxWidth: '1200px',
    margin: '50px auto',
    backgroundColor: '#f7f9fc',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid #ccc',
    padding: '20px',
    backgroundColor: '#f1f3f8',
    height: '100vh',
    overflowY: 'scroll',
  },
  userList: {
    marginTop: '20px',
  },
  userItem: {
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginBottom: '10px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  chatBoxContainer: {
    flex: 1,
    padding: '30px',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  chatBox: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '15px',
    height: '300px',
    overflowY: 'scroll',
    backgroundColor: '#fff',
    marginBottom: '15px',
  },
  messageBubble: {
    backgroundColor: '#d0e7ff',
    padding: '10px 15px',
    borderRadius: '20px',
    marginBottom: '10px',
    maxWidth: '80%',
    color: '#333',
  },
  form: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px 15px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
};

export default ChatApp;
