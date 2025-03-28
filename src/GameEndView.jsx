import React, { useState, useEffect } from 'react';
import Confetti from 'react-dom-confetti';
import ChatBox from './ChatBox';

const GameEndView = ({
  socket,
  roomId,
  username,
  gameResult,
  showConfetti,
  confettiConfig,
  rematchStatus,
  handleRematch,
  onExit, // This will handle all state resets
  isChatOpen,
  setIsChatOpen,
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  const handleExit = () => {
    // Safely check if socket exists before emitting
    if (socket) {
      // Emit exit room event to the server
      socket.emit('exitRoom', { roomId, username });
      
      // Disconnect from the socket
      socket.disconnect();
      socket.connect();
    }
    
    // Call the exit handler passed from parent
    // This will handle all state resets
    if (onExit) {
      onExit();
    }
  };

  useEffect(() => {
    // Update time remaining if provided in rematch status
    if (rematchStatus?.timeRemaining !== undefined) {
      setTimeRemaining(rematchStatus.timeRemaining);
    }
  }, [rematchStatus]);

  useEffect(() => {
    // Countdown timer
    let timer;
    if (timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeRemaining]);

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
        <div className="mb-4">
          <p className="text-xl">
            {rematchStatus.current === 0 
              ? "Esperando revancha..." 
              : `Revancha (${rematchStatus.current}/${rematchStatus.total})`
            }
          </p>
          {timeRemaining !== null && timeRemaining > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Tiempo restante: {timeRemaining} segundos
            </p>
          )}
          {rematchStatus.current === 1 && (
            <p className="text-sm text-gray-600 mt-1">
              Un jugador ha solicitado revancha
            </p>
          )}
        </div>
        <div className="flex space-x-4 justify-center">
          <button 
            onClick={handleRematch}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
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