import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [currentView, setCurrentView] = useState('username');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
      multiplex: false
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setErrorMessage(`Connection failed: ${error.message}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (data) => {
      setGameState(data.roomDetails);
      setRoomId(data.roomId);
      setCurrentView('waitingRoom');
    };

    const handleGameStarted = (roomDetails) => {
      setGameState(roomDetails);
      setCurrentView('game');
    };

    const handleUpdateGame = (roomDetails) => {
      setGameState(roomDetails);
    };

    const handleGameEnded = (result) => {
      alert(`Juego Terminado! ${
        result.winner === 'Draw' 
          ? 'Empate' 
          : `Ganador: ${result.winner}`
      }`);
      setCurrentView('username');
      setGameState(null);
    };

    const handleRoomError = (message) => {
      setErrorMessage(message);
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('gameStarted', handleGameStarted);
    socket.on('updateGame', handleUpdateGame);
    socket.on('gameEnded', handleGameEnded);
    socket.on('roomError', handleRoomError);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('gameStarted', handleGameStarted);
      socket.off('updateGame', handleUpdateGame);
      socket.off('gameEnded', handleGameEnded);
      socket.off('roomError', handleRoomError);
    };
  }, [socket]);

  const createRoom = () => {
    if (!username.trim()) {
      setErrorMessage('Por favor ingresa un nombre de usuario');
      return;
    }
    socket.emit('createRoom', username);
  };

  const joinRoom = () => {
    if (!username.trim()) {
      setErrorMessage('Por favor ingresa un nombre de usuario');
      return;
    }
    if (!roomId.trim()) {
      setErrorMessage('Por favor ingresa un código de sala');
      return;
    }
    socket.emit('joinRoom', { roomId, username });
  };

  const makeMove = (position) => {
    if (gameState && gameState.status === 'playing') {
      socket.emit('makeMove', { roomId, position });
    }
  };

  const renderBoard = () => {
    // Add a guard clause to prevent rendering if gameState is not defined
    if (!gameState || !gameState.board) {
      return null;
    }

    return gameState.board.map((cell, index) => (
      <div 
        key={index} 
        onClick={() => makeMove(index)}
        className={`
          w-32 h-32 border-4 border-purple-700 
          flex items-center justify-center text-6xl font-bold
          cursor-pointer hover:bg-purple-100
          ${cell === null ? 'text-gray-300' : cell === 'X' ? 'text-blue-600' : 'text-red-600'}
        `}
      >
        {cell || ''}
      </div>
    ));
  };

  const renderContent = () => {
    switch(currentView) {
      case 'username':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
              <h2 className="text-3xl mb-4 text-center">Tic Tac Toe</h2>
              {errorMessage && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
                  {errorMessage}
                </div>
              )}
              <input 
                type="text" 
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Tu nombre de usuario"
                className="w-full p-3 border-2 border-purple-300 rounded-lg mb-4"
              />
              <div className="flex space-x-4">
                <button 
                  onClick={createRoom}
                  className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  Crear Sala
                </button>
                <button 
                  onClick={() => setCurrentView('joinRoom')}
                  className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                >
                  Unirse a Sala
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'waitingRoom':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
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
      
      case 'joinRoom':
        return (
          <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
              <h2 className="text-3xl mb-4 text-center">Unirse a Sala</h2>
              {errorMessage && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
                  {errorMessage}
                </div>
              )}
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Código de Sala"
                className="w-full p-3 border-2 border-purple-300 rounded-lg mb-4"
              />
              <button 
                onClick={joinRoom}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
              >
                Unirse
              </button>
            </div>
          </div>
        );

      case 'game':
        // Add a guard clause to prevent rendering without complete gameState
        if (!gameState || !gameState.players || !gameState.board) {
          return null;
        }

        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="bg-white p-8 rounded-xl shadow-2xl mb-6 w-full max-w-2xl">
              <h2 className="text-3xl text-center mb-4">Tic Tac Toe</h2>
              <div className="flex justify-between mb-4">
                <div className="flex space-x-4">
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
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
}

export default App;