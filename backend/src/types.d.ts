import { Server as SocketIOServer } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
      };
      io?: SocketIOServer;
    }
  }
}
