import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventType } from './eventType.enum';
import { GameDto } from '../game/graphql/dto/Game.dto';

@Injectable()
@WebSocketGateway()
export class GatewayService {
  @WebSocketServer() server: Server;

  emitCustomEvent(event: string, data: any): void {
    this.server.emit(event, data);
  }

  @OnEvent(EventType.UpdateUserBalance)
  notificateUpdateUserBalance(payload: { id: string; balance: number }) {
    this.server.emit(EventType.UpdateUserBalance + payload.id, payload);
  }

  @OnEvent(EventType.UpdateHistory)
  notificateUpdateHistory(payload: GameDto) {
    this.server.emit(EventType.UpdateHistory, payload);
  }
}
