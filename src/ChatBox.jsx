import React, { useState, useEffect } from 'react'; 
import { Send, X, MessageCircle, Maximize2, Minimize2, Circle } from 'lucide-react';  

// Improved color generation with more distinct colors
const generateUniqueColor = (username) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', 
    '#6C5CE7', '#A8E6CF', '#FF8ED4', '#FAD390', 
    '#6A89CC', '#82CC99'
  ];
  
  // Create a consistent hash for the username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to select a consistent color
  return colors[Math.abs(hash) % colors.length];
};

const ChatBox = ({   
  isChatOpen,   
  setIsChatOpen,   
  chatMessages,   
  chatInput,   
  setChatInput,   
  sendChatMessage,
  currentUsername
}) => {   
  const [isFullscreen, setIsFullscreen] = useState(false);    
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0);

  // Format timestamp for messages
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  useEffect(() => {
    if (chatMessages.length > lastReadMessageCount) {
      setHasNewMessages(true);
    }
  }, [chatMessages, lastReadMessageCount]);

  const toggleFullscreen = () => {     
    setIsFullscreen(!isFullscreen);   
  };    

  const openChat = () => {
    setIsChatOpen(true);
    setHasNewMessages(false);
    setLastReadMessageCount(chatMessages.length);
  };

  const closeChatMobile = () => {     
    setIsChatOpen(false);     
    setIsFullscreen(false);   
  };    

  return (     
    <>       
      {/* Mobile Open Chat Button */}
      <button          
        onClick={openChat}         
        className="fixed bottom-4 left-4 z-[10] bg-blue-500 text-white p-3 rounded-full shadow-lg md:hidden"       
      >         
        <MessageCircle size={24} />
        {hasNewMessages && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>        
      
      {/* Mobile Close Button */}
      {isChatOpen && (
        <button 
          onClick={closeChatMobile}
          className="fixed top-4 left-4 z-[10000] bg-red-500 text-white p-2 rounded-full shadow-lg md:hidden"
        >
          <X size={24} />
        </button>
      )}
      
      <div className={`         
        fixed z-50 right-4          
        ${isChatOpen ? 'block' : 'hidden md:block'}         
        ${isFullscreen            
          ? 'top-0 left-0 w-full h-full p-0 bg-white'            
          : 'bottom-4 w-80 h-[90vh]'}       
      `}>         
        <div className={`           
          bg-white rounded-xl shadow-lg flex flex-col           
          ${isFullscreen ? 'h-full' : 'h-full'}         
        `}>           
          {/* Header */}           
          <div className="flex justify-between items-center p-2 bg-blue-500 text-white rounded-t-xl relative">             
            <h3 className="text-lg font-semibold">Chat</h3>             
            <div className="flex space-x-2 items-center">
              {hasNewMessages && !isFullscreen && (
                <div className="text-red-300 flex items-center">
                  <Circle size={10} className="mr-1 animate-pulse" />
                  <span className="text-xs">Nuevos mensajes</span>
                </div>
              )}
              
              <button onClick={toggleFullscreen}>                 
                {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}               
              </button>             
            </div>           
          </div>            
          
          {/* Messages container */}           
          <div              
            id="chat-messages"             
            className={`               
              overflow-y-auto p-4 flex flex-col space-y-2 flex-grow               
              ${isFullscreen ? 'h-[calc(100%-120px)]' : 'h-full'}             
            `}
            onClick={() => {
              setHasNewMessages(false);
              setLastReadMessageCount(chatMessages.length);
            }}
          >             
            {chatMessages.map((msg, index) => (               
              <div 
                key={index} 
                className={`
                  w-full flex flex-col
                  ${msg.username === currentUsername 
                    ? 'items-end' 
                    : 'items-start'}
                `}
              >
                <div 
                  className={`
                    max-w-[70%] p-2 rounded-lg flex flex-col
                    ${msg.username === currentUsername 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-black'}
                  `}
                >
                  <div className="flex justify-between w-full items-center">
                    <span 
                      className="font-bold mr-2" 
                      style={{ 
                        color: msg.username === currentUsername 
                          ? 'white' 
                          : generateUniqueColor(msg.username) 
                      }}
                    >
                      {msg.username}
                    </span>
                    <span className="text-xs opacity-70 ml-2">
                      {formatTime(msg.timestamp || new Date())}
                    </span>
                  </div>
                  <span className="mt-1">{msg.message}</span>
                </div>
              </div>
            ))}           
          </div>            
          
          {/* Message input */}           
          <div className="flex p-2">             
            <input                
              type="text"                
              value={chatInput}               
              onChange={(e) => setChatInput(e.target.value)}               
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}               
              placeholder="Escribe un mensaje..."               
              className="flex-grow p-2 border rounded-l-lg"
              onClick={() => {
                setHasNewMessages(false);
                setLastReadMessageCount(chatMessages.length);
              }}             
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
};  

export default ChatBox;