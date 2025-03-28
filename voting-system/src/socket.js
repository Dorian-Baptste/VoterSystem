// This file handles Socket.IO connections and emits events for real-time updates
const socketIo = require("socket.io");
const io = socketIo();

module.exports = io;
