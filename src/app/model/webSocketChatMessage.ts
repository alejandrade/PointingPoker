import {Room} from './room';
import {User} from './user';

export class WebSocketChatMessage {
  public type: string;
  public story: string;
  public sender: User;
  public room: Room;
}
