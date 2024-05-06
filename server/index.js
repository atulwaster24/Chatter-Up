import express from 'express';
import {Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import router from './Routes.js';
import { addUser, getUser, removeUser } from './users.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        credentials: true,
    }
});

io.on('connection', (socket) =>{
    socket.on('join', ({name, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, name, room});

        if(error){
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined.`});


        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user: user.name, text: message});
        callback();
    });
    
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', {user: 'Admin', text: `${user.name} has left.`});
        }
    })
});

const PORT = 5000;

app.use(router);

server.listen(PORT, ()=>{
    console.log(`Server is running at Port: ${PORT}`);
})