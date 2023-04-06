import { io } from 'socket.io-client';

const socketInit = () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 'Infinity',
        timeout: 1000,
        enabledTransports: ["ws", "wss"],// important
    };
    return io(process.env.REACT_APP_API_URL, options);
};

export default socketInit;
