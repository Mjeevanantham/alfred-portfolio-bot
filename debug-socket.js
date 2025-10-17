// Debug script to test Socket.IO connection
console.log('Testing Socket.IO connection...');

// Check if Socket.IO is loaded
if (typeof io === 'undefined') {
    console.error('❌ Socket.IO is not loaded!');
} else {
    console.log('✅ Socket.IO is loaded');
    
    // Try to connect
    const testSocket = io();
    
    testSocket.on('connect', () => {
        console.log('✅ Connected to server:', testSocket.id);
    });
    
    testSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
    });
    
    testSocket.on('disconnect', (reason) => {
        console.log('⚠️ Disconnected:', reason);
    });
    
    // Test after 2 seconds
    setTimeout(() => {
        if (testSocket.connected) {
            console.log('✅ Socket.IO connection is working');
            testSocket.disconnect();
        } else {
            console.error('❌ Socket.IO connection failed');
        }
    }, 2000);
}
