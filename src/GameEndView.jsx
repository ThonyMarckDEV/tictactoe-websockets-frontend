import React, { useState, useEffect } from 'react';
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
  sendChatMessage
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
        <div className="flex space-x-4 justify-center">
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