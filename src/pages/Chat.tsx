import { useState } from "react";
import { Send, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const channels = ["General", "Tech Talk", "Random", "Gaming"];

export default function ChatApp() {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [currentChannel, setCurrentChannel] = useState("General");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: "You", text: input }]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-gray-900 text-white p-4 flex flex-col"
      >
        <h2 className="text-xl font-bold mb-4">Channels</h2>
        {channels.map((channel) => (
          <button
            key={channel}
            onClick={() => setCurrentChannel(channel)}
            className={`p-2 rounded-lg w-full text-left transition ${
              currentChannel === channel ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            {channel}
          </button>
        ))}
        <Button variant="outline" className="mt-4 w-full flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Add Channel
        </Button>
      </motion.div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="p-4 bg-white shadow text-xl font-semibold">
          {currentChannel}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-3 rounded-lg shadow-md w-fit max-w-xs"
            >
              <strong>{msg.user}: </strong> {msg.text}
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white shadow flex items-center gap-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded-lg outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
