
import React from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

const ChatBox = ({
  isChatOpen,
  setIsChatOpen,
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage
}) => (
  <>
    <button 
      onClick={() => setIsChatOpen(!isChatOpen)}
      className="fixed bottom-4 left-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg"
    >
      {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
    </button>
    <div className={`
      fixed bottom-4 right-4 z-50 w-80 
      ${isChatOpen ? 'block' : 'hidden md:block'}
    `}>
      <div className="bg-white rounded-xl shadow-lg">
        <div 
          id="chat-messages" 
          className="h-64 overflow-y-auto p-4 border-b"
        >
          {chatMessages.map((msg, index) => (
            <div key={index} className="mb-2">
              <span className="font-bold">{msg.username}: </span>
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
        <div className="flex p-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-grow p-2 border rounded-l-lg"
          />
          <button 
            onClick={sendChatMessage}
            className="bg-blue-500 text-white p-2 rounded-r-lg"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  </>
);

export default ChatBox;