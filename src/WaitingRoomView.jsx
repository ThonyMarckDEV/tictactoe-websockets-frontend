
// src/components/WaitingRoomView.jsx
import React from 'react';

const WaitingRoomView = ({ roomId }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
    <div className="bg-white p-8 rounded-xl shadow-2xl text-center w-full max-w-md">
      <h2 className="text-3xl mb-4">Sala Creada</h2>
      <p className="mb-4">Código de Sala: <strong>{roomId}</strong></p>
      <p className="mb-4">Esperando que otro jugador se una...</p>
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        <span>Esperando conexión</span>
      </div>
    </div>
  </div>
);

export default WaitingRoomView;