import {Room} from './room';

export class WebSocketChatMessage {
  public type: string;
  public story: string;
  public sender: string;
  public room: Room;
}
