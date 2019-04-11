import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Room} from '../../model/room';
import {User} from '../../model/user';
import {falseIfMissing} from 'protractor/built/util';
import {Story} from '../../model/story';
import {StompHandlerService} from '../../service/stomp-handler.service';
import {WebSocketChatMessage} from '../../model/webSocketChatMessage';
import {bsDatepickerReducer} from 'ngx-bootstrap/datepicker/reducer/bs-datepicker.reducer';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {

  room: Room;
  story: Story;
  currentUser: User;

  private sub: any;
  constructor(private route: ActivatedRoute, private stompHandler: StompHandlerService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe((param) => {
      this.room = new Room();
      this.currentUser = new User();
      this.currentUser.name = param.userName;
      this.room.id = param.roomId;
      this.stompHandler.initializeWebSocketConnection(this.room, this.currentUser.name, (webSocker: WebSocketChatMessage) =>
      {
        this.room = webSocker.room;
      });
    });

  }

  vote(num: number) {
    this.currentUser.vote = num;
    let avergageVote = 0;
    this.synchronizeIterate((user) => {
      if (this.currentUser.name === user.name) {
        user.vote = num;
      }
      if (user.vote) {
        avergageVote += user.vote;
      }
    });

    const currentStory = this.room.currentStory || new Story();
    currentStory.score = avergageVote;
    this.room.currentStory = currentStory;;

    this.stompHandler.publish(this.room, this.currentUser.name);
  }

  showVotes(show: boolean) {
    this.room.showVotes = show;
    this.synchronizeIterate((user) => {
      if (this.currentUser.name === user.name) {
        this.room.showVotes = show;
      }
    });
    this.stompHandler.publish(this.room, this.currentUser.name);
  }

  clearVotes() {
    this.synchronizeIterate((user) => {
      delete user.vote;
      this.showVotes(false);
    });
    const story = this.room.currentStory;
    if (!story.storyName) {
      story.storyName = Math.random().toString(36).substr(2, 9);
    }

    this.room.stories.push(story);
    delete this.room.currentStory;

    this.stompHandler.publish(this.room, this.currentUser.name);
  }

  getStory(): Story {
    const currentStory = this.room.currentStory;
    return currentStory == null ? new Story() : currentStory;
  }

  synchronizeIterate(action: (user: User) => void) {
    for (const user of this.room.users) {
      action(user);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
