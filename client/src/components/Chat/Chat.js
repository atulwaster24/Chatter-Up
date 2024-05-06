import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import {io} from 'socket.io-client';

import './Chat.css';
import InfoBar from '../InfoBar/InfoBar';
import { Input } from '../Input/Input';
import Messages from '../Messages/Messages';

let socket;
const ENDPOINT = "localhost:5000";

const Chat = () => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(()=>{
    const query = queryString.parse(window.location.search);

    socket = io(ENDPOINT);  

    setName(query.name);
    setRoom(query.room);
    
    socket.emit('join', {name:query.name, room: query.room}, (error)=>{
      if(error){
        alert(error);
      }
    });

  },[]);

  useEffect(()=>{
    socket.on('message', (message) => {
      setMessages(messages => [...messages, message]);
    })
  },[]);

  //funct for sending messages.

  const sendMessage = (e) => {
    e.preventDefault();
    if(message){
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  };

  return (
    <div className='outerContainer'> 
        <div className='container'>
          <InfoBar room={room}/>
          <Messages messages={messages} name={name}/>
          <Input message={message} sendMessage={sendMessage} setMessage={setMessage}/>

            
        </div>
    </div>
  )
}

export default Chat