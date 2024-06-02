import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class GatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('message', 'You are now connected to the WebSocket server');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleMessage(client: Socket, payload: string): void {
    console.log(`Received message from client: ${payload}`);
    client.emit('message', `You sent: ${payload}`);
  }

  emitCustomEvent(event: string, data: any): void {
    console.log('emitCustomEvent', event);
    this.server.emit(event, data);
  }

  // Example method to listen for a custom event from clients
  @SubscribeMessage('customEvent')
  handleCustomEvent(client: Socket, data: any): void {
    console.log(`Received custom event from client: ${data}`);
    // You can perform actions based on the received data
  }
}
