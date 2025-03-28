// import React, { useState, useEffect } from 'react';
// import Confetti from 'react-dom-confetti';
// import ChatBox from './ChatBox';

// const GameEndView = ({
//   socket,
//   gameResult,
//   showConfetti,
//   confettiConfig,
//   onExit,
//   isChatOpen,
//   setIsChatOpen,
//   chatMessages,
//   chatInput,
//   setChatInput,
//   sendChatMessage,
//   //REMATCH
//   rematchStatus,
//   handleRematch,
// }) => {

//   const handleExit = () => {
//     if (socket) {
//       socket.disconnect();
//       socket.connect();
//     }

//     onExit();
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
//       <div className="absolute top-0 left-0 w-full">
//         <Confetti active={showConfetti} config={confettiConfig} />
//       </div>
//       <div className="mb-4">
//         <p className="text-xl">
//           {rematchStatus.current === 0 
//             ? "Esperando revancha..." 
//             : `Revancha (${rematchStatus.current}/${rematchStatus.total})`
//           }
//         </p>
//       </div>
//       <div className="bg-white p-8 rounded-xl shadow-2xl text-center w-full max-w-md">
//         <h2 className="text-4xl mb-6">
//           {gameResult.winner === 'Draw'
//             ? '¡Empate!'
//             : `¡Ganador: ${gameResult.winner}!`
//           }
//         </h2>
//         <div className="flex space-x-4 justify-center">
//           <button 
//             onClick={handleRematch}
//             className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
//           >
//             Revancha
//           </button>
//           <button
//             onClick={handleExit}
//             className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
//           >
//             Salir
//           </button>
//         </div>
//       </div>
//       <ChatBox
//         isChatOpen={isChatOpen}
//         setIsChatOpen={setIsChatOpen}
//         chatMessages={chatMessages}
//         chatInput={chatInput}
//         setChatInput={setChatInput}
//         sendChatMessage={sendChatMessage}
//       />
//     </div>
//   );
// };

// export default GameEndView;

import React from 'react';
import Confetti from 'react-dom-confetti';
import ChatBox from './ChatBox';

const GameEndView = ({
  socket,
  gameResult,
  showConfetti,
  confettiConfig,
  onExit,
  isChatOpen,
  setIsChatOpen,
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
  rematchStatus,
  handleRematch,
  username, // Add this prop to get current player's username
}) => {
  const handleExit = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
    onExit();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="absolute top-0 left-0 w-full">
        <Confetti active={showConfetti} config={confettiConfig} />
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center w-full max-w-md">
        <h2 className="text-4xl mb-6">
          {gameResult.winner === 'Draw'
            ? '¡Empate!'
            : `¡Ganador: ${gameResult.winner}!`
          }
        </h2>
        
        {/* Rematch Status Modal */}
        <div className="mb-4 bg-gray-100 p-4 rounded-lg">
          <p className="text-xl font-semibold mb-2">Revancha</p>
          <div className="flex justify-center items-center space-x-2">
            {[1, 2].map((num) => (
              <div 
                key={num} 
                className={`w-10 h-10 rounded-full border-2 ${
                  num <= rematchStatus.current 
                    ? 'bg-green-500 border-green-500' 
                    : 'bg-gray-300 border-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-gray-700">
            {rematchStatus.current === 0 
              ? "Esperando que los jugadores acepten la revancha..." 
              : `Jugadores aceptados: ${rematchStatus.current}/2`
            }
          </p>
          
          {/* Show accepted players */}
          {rematchStatus.players && rematchStatus.players.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Jugadores que han aceptado:
              </p>
              <div className="flex justify-center space-x-2 mt-1">
                {rematchStatus.players.map((player, index) => (
                  <span 
                    key={index} 
                    className={`px-2 py-1 rounded-full text-xs ${
                      player === username 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {player === username ? 'Tú' : player}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 justify-center">
          <button 
            onClick={handleRematch}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
            disabled={rematchStatus.current === 2}
          >
            Revancha
          </button>
          <button
            onClick={handleExit}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Salir
          </button>
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

export default GameEndView;