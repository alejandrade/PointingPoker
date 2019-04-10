import {User} from './user';
import {Story} from './story';

export class Room {
  public id: string;
  public showVotes: boolean;
  public users: Array<User>;
  public currentStory: Story;
  public stories: Array<Story>;
}
