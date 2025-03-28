import React from 'react';
import ChatBox from './ChatBox';

const GameView = ({
   gameState,
   roomId,
   makeMove,
   isChatOpen,
   setIsChatOpen,
   chatMessages,
   chatInput,
   setChatInput,
   sendChatMessage,
   socket,
   onExit
}) => {
   const handleExit = () => {
     if (socket) {
       socket.disconnect();
       socket.connect();
     }
     
     onExit();
   };

   const renderBoard = () => {
     if (!gameState || !gameState.board) return null;
     
     return gameState.board.map((cell, index) => (
       <div
          key={index}
          onClick={() => makeMove(index)}
         className={`
           w-full aspect-square border-4 border-purple-700
            flex items-center justify-center text-4xl md:text-6xl font-bold
           cursor-pointer hover:bg-purple-100
           ${cell === null ? 'text-gray-300' : cell === 'X' ? 'text-blue-600' : 'text-red-600'}
         `}
       >
         {cell || ''}
       </div>
     ));
   };
   
   return (
     <div className="relative flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
       <div className="bg-white p-8 rounded-xl shadow-2xl mb-4 md:mb-0 w-full max-w-2xl">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-3xl">Tic Tac Toe</h2>
           <button
             onClick={handleExit}
             className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
           >
             Salir
           </button>
         </div>
         <div className="flex flex-col md:flex-row justify-between mb-4">
           <div className="flex space-x-4 mb-2 md:mb-0">
             <div>
               <span className="font-bold">Sala:</span> {roomId}
             </div>
           </div>
           <div className="flex space-x-4">
             {gameState.players.map((player, index) => (
               <div
                  key={player.id}
                  className={`
                   p-2 rounded-lg
                   ${gameState.currentPlayerIndex === index
                      ? 'bg-green-200'
                      : 'bg-gray-100'
                   }
                 `}
               >
                 <span className="font-bold">{player.username}</span>
                 <span className="ml-2 text-sm">({player.symbol})</span>
               </div>
             ))}
           </div>
         </div>
         <div className="grid grid-cols-3 gap-2 mb-4">
           {renderBoard()}
         </div>
         <div className="text-center">
           <p className="text-xl">
             Turno de: {gameState.players[gameState.currentPlayerIndex].username}
           </p>
         </div>
       </div>
       
       <ChatBox
         isChatOpen={isChatOpen}
         setIsChatOpen={setIsChatOpen}
         chatMessages={chatMessages}
         chatInput={chatInput}
         setChatInput={setChatInput}
         sendChatMessage={sendChatMessage}
       />
     </div>
   );
};

export default GameView;