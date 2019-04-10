import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import {Room} from '../model/room';
import {WebSocketChatMessage} from '../model/webSocketChatMessage';


@Injectable({
  providedIn: 'root'
})
export class StompHandlerService {
  private stompClient: any;

  initializeWebSocketConnection(room: Room, user: string, setRoom: any) {
    const ws = new SockJS('http://localhost:9999/websocket');
    this.stompClient = Stomp.over(ws);
    this.stompClient.connect({}, () => {
      this.connectionSuccess(room, user, setRoom);
    });
  }

  publish(room: Room, user: string) {
    if (this.stompClient) {
      const chatMessage = {
        sender : user,
        room,
        type : 'UPDATE'
      };
      this.stompClient.send(`/app/chat/${room.id}/sendMessage`, {}, JSON
        .stringify(chatMessage));
    }
  }


  private connectionSuccess(room: Room, user: string, setRoom: any) {
      this.stompClient.subscribe(`/topic/room/${room.id}`, (payload: any) => this.onMessageReceived(payload, setRoom));
      this.stompClient.send(`/app/chat/${room.id}/addUser`, {}, JSON.stringify({
        sender: user,
        type: 'UPDATE',
        room
      }));
  }


  private onMessageReceived(payload: any, setRoom: any) {
    const webSocketMessage = JSON.parse(payload.body) as WebSocketChatMessage;
    setRoom(webSocketMessage);
  }

}
