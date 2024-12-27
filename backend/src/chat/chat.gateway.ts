import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoomService } from './chat.service';
import { MessageService } from '../message/message.service';
import { webuser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/models/user.schema';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';

@UseGuards(AuthGuard)
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Specify the allowed origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService, // Add JwtService to the constructor
  ) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { chatRoomId: string; content: string },
    @webuser() currentUser: User & { userId: string },
  ) {
    if (!currentUser) {
      throw new WsException('User not authenticated');
    }

    const message = await this.messageService.createMessage(data.chatRoomId, currentUser.userId, data.content);
    // Emit to everyone in the room *except* the sender
    this.server.to(data.chatRoomId).emit('receiveMessage', message);
    return message; // You might not need to return this
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { chatRoomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.chatRoomId);
    return { event: 'joinedRoom', chatRoomId: data.chatRoomId };
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @MessageBody() data: { messageId: string; isRead?: boolean; content?: string },
    @webuser() currentUser: User,
  ) {
    const updatedMessage = await this.messageService.updateMessage(data.messageId, data.isRead, data.content);
    this.server.emit('messageUpdated', updatedMessage);
    return updatedMessage;
  }

  // Triggered when the gateway is initialized
  afterInit(server: Server) {
    console.log('Initialized Gateway');
  }

  handleConnection(client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie;
      if (!cookies) {
        throw new WsException('No cookies found');
      }

      const { auth_token } = cookie.parse(cookies);
      if (!auth_token) {
        throw new WsException('No token, please login');
      }

      const decoded = this.jwtService.verify(auth_token, {
        secret: 'your_jwt_secret', // Ensure the secret is the same as used in token generation
      });
      client.data.user = decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      client.disconnect();
      throw new WsException('Invalid token');
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
}