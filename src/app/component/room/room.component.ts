import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Room} from '../../model/room';
import {User} from '../../model/user';
import {falseIfMissing} from 'protractor/built/util';
import {Story} from '../../model/story';
import {StompHandlerService} from '../../service/stomp-handler.service';
import {WebSocketChatMessage} from '../../model/webSocketChatMessage';

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
  }

  showVotes(show: boolean) {
    this.room.showVotes = show;
  }

  clearVotes() {
    this.room.users.forEach(user => {
      delete user.vote;
      this.showVotes(false);
    });
  }

  getStory(): Story {
    const currentStory = this.room.currentStory;
    return currentStory == null ? new Story() : currentStory;
  }

  addToHistory() {
  }

  publish() {
    // publish to servers
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
