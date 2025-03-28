import React, { useEffect } from 'react';

const JoinRoomView = ({
    roomId,
    errorMessage,
    setRoomId,
    setErrorMessage,
    joinRoom
}) => {
    // Reset room ID when component mounts
    useEffect(() => {
        // Clear room ID when entering this view
        setRoomId('');
        setErrorMessage('');
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
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
};

export default JoinRoomView;