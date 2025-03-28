// src/App.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import UsernameView from './UsernameView';
import WaitingRoomView from './WaitingRoomView';
import JoinRoomView from './JoinRoomView';
import GameView from './GameView';
import GameEndView from './GameEndView';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [currentView, setCurrentView] = useState('username');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 200,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
  };



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

    newSocket.on('connect', () => console.log('Socket connected successfully'));
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setErrorMessage(`Connection failed: ${error.message}`);
    });
    newSocket.on('disconnect', (reason) => console.log('Disconnected:', reason));

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);


  useEffect(() => {
    if (!socket) return;

    const handleSocketEvents = {

      roomCreated: (data) => {
        setGameState(data.roomDetails);
        setRoomId(data.roomId);
        setCurrentView('waitingRoom');
        setChatMessages([]);
      },

      gameStarted: (roomDetails) => {
        setGameState(roomDetails);
        setCurrentView('game');
        setGameResult(null);
        setShowConfetti(false);
        setChatMessages([]);
      },

      updateGame: (roomDetails) => {
        setGameState(roomDetails);
      },

      gameEnded: (result) => {
        setGameResult(result);
        setCurrentView('gameEnd');
        setShowConfetti(result.winner !== 'Draw');
        setChatMessages([]);
      },

      roomError: (message) => {
        setErrorMessage(message);
      },

      playerLeft: () => {
        setCurrentView('username');
        setGameState(null);
        setGameResult(null);
        alert('El otro jugador ha abandonado la sala.');
      },

      receiveChatMessage: (message) => {
        setChatMessages(prev => [...prev, message]);
      },

      forceDisconnect: () => {
        // Handle forced disconnection
        setCurrentView('username');
        setGameState(null);
        setGameResult(null);
        alert('La sala ha sido cerrada debido a la falta de acuerdo para la revancha.');
      },
    };

    Object.entries(handleSocketEvents).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handleSocketEvents).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket]);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

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

  const handleExit = () => {
    setCurrentView('username');
    setGameState(null);
    setGameResult(null);
    setUsername(''); // Add this line to reset username
    setRoomId('');   // Add this line to reset room ID
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && socket) {
      socket.emit('sendChatMessage', { 
        roomId, 
        username, 
        message: chatInput.trim() 
      });
      setChatInput('');
    }
  };

  const renderContent = () => {
    switch(currentView) {
      case 'username':
        return (
          <UsernameView 
            username={username}
            errorMessage={errorMessage}
            setUsername={setUsername}
            setErrorMessage={setErrorMessage}
            createRoom={createRoom}
            setCurrentView={setCurrentView}
          />
        );
      case 'waitingRoom':
        return <WaitingRoomView roomId={roomId} />;
      case 'joinRoom':
        return (
          <JoinRoomView 
            roomId={roomId}
            errorMessage={errorMessage}
            setRoomId={setRoomId}
            setErrorMessage={setErrorMessage}
            joinRoom={joinRoom}
          />
        );
      case 'game':
        return (
          <GameView
            gameState={gameState}
            roomId={roomId}
            makeMove={makeMove}

            // Para el chat
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendChatMessage={sendChatMessage}
          />
        );
      case 'gameEnd':
        return (
          <GameEndView 
            socket={socket}
            roomId={roomId}
            username={username}
            onExit={handleExit}
            gameResult={gameResult}
            showConfetti={showConfetti}
            confettiConfig={confettiConfig}

            // Para el chat
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendChatMessage={sendChatMessage}
          />
        );
      default:
        return null;
    }
  };

  return renderContent();
}

export default App;