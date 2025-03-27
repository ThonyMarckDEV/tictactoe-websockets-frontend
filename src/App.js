import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [currentView, setCurrentView] = useState('username');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Chat-related state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Emoji support function
  const processEmojis = (message) => {
    const emojiMap = {
      ':)': '😊', 
      ':(': '😞', 
      ':D': '😄', 
      ':P': '😛', 
      '<3': '❤️', 
      ':O': '😮', 
      ';)': '😉'
    };

    return message.split(' ').map(word => 
      emojiMap[word] || word
    ).join(' ');
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const newSocket = io('https://tictactoeback.thonymarckdev.online', {
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

    const handleChatMessage = (messageData) => {
      setChatMessages(prev => [...prev, {
        ...messageData,
        message: processEmojis(messageData.message)
      }]);
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('gameStarted', handleGameStarted);
    socket.on('updateGame', handleUpdateGame);
    socket.on('gameEnded', handleGameEnded);
    socket.on('roomError', handleRoomError);
    socket.on('receiveChatMessage', handleChatMessage);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('gameStarted', handleGameStarted);
      socket.off('updateGame', handleUpdateGame);
      socket.off('gameEnded', handleGameEnded);
      socket.off('roomError', handleRoomError);
      socket.off('receiveChatMessage', handleChatMessage);
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

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    socket.emit('sendChatMessage', {
      roomId,
      username,
      message: chatInput
    });

    setChatInput('');
  };

  const renderBoard = () => {
    if (!gameState || !gameState.board) {
      return null;
    }

    return gameState.board.map((cell, index) => (
      <div 
        key={index} 
        onClick={() => makeMove(index)}
        className={`
          w-full aspect-square border-2 border-purple-700 
          flex items-center justify-center text-2xl md:text-4xl font-bold
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
        if (!gameState || !gameState.players || !gameState.board) {
          return null;
        }

        return (
          <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-purple-500 to-pink-500">
            {/* Game Board Section */}
            <div className="w-full md:w-2/3 flex flex-col items-center justify-center p-2 md:p-4">
              <div className="bg-white p-4 rounded-xl shadow-2xl mb-2 w-full max-w-md">
                <h2 className="text-2xl text-center mb-2">Tic Tac Toe</h2>
                
                {/* Room and Players Info */}
                <div className="flex flex-col md:flex-row justify-between mb-2">
                  <div className="flex space-x-2 mb-1 md:mb-0 text-sm">
                    <div>
                      <span className="font-bold">Sala:</span> {roomId}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center space-x-1">
                    {gameState.players.map((player, index) => (
                      <div 
                        key={player.id} 
                        className={`
                          p-1 rounded-lg text-xs
                          ${gameState.currentPlayerIndex === index 
                            ? 'bg-green-200' 
                            : 'bg-gray-100'
                          }
                        `}
                      >
                        <span className="font-bold">{player.username}</span>
                        <span className="ml-1">({player.symbol})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Board */}
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {renderBoard()}
                </div>

                {/* Current Turn */}
                <div className="text-center">
                  <p className="text-sm md:text-base">
                    Turno de: {gameState.players[gameState.currentPlayerIndex].username}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Section with Mobile Toggle */}
            <div className="fixed bottom-4 right-4 z-50 md:hidden">
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-purple-600 text-white p-3 rounded-full shadow-lg"
              >
                {isChatOpen ? '✖' : '💬'}
              </button>
            </div>

            <div className={`
              fixed inset-0 bg-black/50 z-40 
              ${isChatOpen ? 'block md:hidden' : 'hidden'}
              `}
              onClick={() => setIsChatOpen(false)}
            ></div>

            <div className={`
              fixed bottom-0 left-0 right-0 
              bg-white rounded-t-xl shadow-2xl
              transition-transform duration-300 z-50
              ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}
              md:static md:translate-y-0 md:block md:w-1/3 md:h-[90%] md:my-auto
              ${isChatOpen ? 'h-[80%]' : 'h-auto'}
            `}>
              <div className="p-3 bg-purple-600 text-white rounded-t-xl flex justify-between items-center">
                <span className="text-sm">Sala Chat: {roomId}</span>
                <button 
                  className="md:hidden"
                  onClick={() => setIsChatOpen(false)}
                >
                  ✖
                </button>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto p-2 h-[calc(100%-120px)]">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className="mb-1 p-1 bg-gray-100 rounded-lg text-sm"
                  >
                    <strong>{msg.username}:</strong> {msg.message}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-2 border-t flex">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-grow p-1 border rounded-l-lg text-sm"
                />
                <button 
                  onClick={sendChatMessage}
                  className="bg-purple-600 text-white px-2 py-1 rounded-r-lg text-sm"
                >
                  Enviar
                </button>
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