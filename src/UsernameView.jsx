import React, { useEffect } from 'react';

const UsernameView = ({
    username,
    errorMessage,
    setUsername,
    setErrorMessage,
    createRoom,
    setCurrentView
}) => {
    // Reset username when component mounts or when leaving the view
    useEffect(() => {
        // Clear username when entering this view
        setUsername('');
        setErrorMessage('');
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
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
};

export default UsernameView;