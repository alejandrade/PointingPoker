import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Room} from '../../model/room';
import {User} from '../../model/user';
import {Story} from '../../model/story';
import {StompHandlerService} from '../../service/stomp-handler.service';
import {WebSocketChatMessage} from '../../model/webSocketChatMessage';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {

  room: Room;
  currentUser: User;

  private cookieName = 'userNameCook';
  private sub: any;

  constructor(private route: ActivatedRoute,
              private stompHandler: StompHandlerService,
              private router: Router,
              private cookie: CookieService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe((param) => {
      this.room = new Room(param.roomId, new Story(this.generateUniqueId()));
      this.currentUser = new User(this.generateUniqueId(), this.cookie.get(this.cookieName));
      this.room.users.push(this.currentUser);
      this.stompHandler
        .initializeWebSocketConnection(this.room, this.currentUser, ( webSocket: WebSocketChatMessage) => this.updateRoom(webSocket.room));
    });
  }

  private updateRoom(room: Room): void {
    this.room = room;
    this.checkIfAllUsersVotes(room.users);
    this.checkIfImConnected();
  }

  private checkIfImConnected(): void {
    if (!this.room.users.find(u => u.id === this.currentUser.id)) {
      this.stompHandler.disconnect();
      alert('You have been disconnected!');
      this.router.navigate(['/']);
    }
  }

  private checkIfAllUsersVotes(users: Array<User>): void {
    if (users != null) {
      const everyUserVoted = users.every((user) => !!user.vote || user.spectator);

      if (everyUserVoted && !this.room.showVotes) {
        this.showVotes(true);
      }
    }
  }


  vote(num: number) {
    this.currentUser.vote = num;
    let avergageVote = 0;
    let noChange = false;
    this.synchronizeIterate((user) => {
      if (this.currentUser.id === user.id) {
        noChange = (user.vote === num);
        user.vote = num;
      }
      if (user.vote) {
        avergageVote += user.vote;
      }
    });

    avergageVote = avergageVote / this.room.users.length;
    this.room.currentStory.score = avergageVote;

    if (!noChange) {
      this.publish();
    }
  }

  reachedConsensus(): boolean {
    const userVotes = this.room.users.map((user) => user.vote);
    return userVotes.every(vote => vote === userVotes[0]);
  }

  updateSpectator(): void {
    this.currentUser.spectator = !this.currentUser.spectator;
    this.synchronizeIterate((user) => {
      if (this.currentUser.id === user.id) {
        user.spectator = this.currentUser.spectator;
      }
    });
    this.publish();
  }

  showVotes(show: boolean) {
    const noChange = this.room.showVotes === show;
    if (!noChange) {
      this.room.showVotes = show;
      this.publish();
    }

  }

  clearVotes() {
    this.room.currentStory.consensus = this.reachedConsensus();

    this.synchronizeIterate((user) => {
      delete user.vote;
      this.showVotes(false);
    });

    if (!this.room.currentStory.id) {
      this.room.currentStory.id = this.generateUniqueId();
    }

    if (!this.room.currentStory.storyName) {
      this.room.currentStory.storyName = this.generateUniqueId();
    }
    this.room.stories.push(this.room.currentStory);
    this.room.currentStory = new Story(this.generateUniqueId());

    this.publish();
  }

  synchronizeIterate(action: (user: User) => void) {
    for (const user of this.room.users) {
      action(user);
    }
  }

  onKeySetStoryName(event): void {
    this.room.currentStory.storyName = event.target.value;
    this.publish();
  }

  onKeyChangeUsername(event): void {
    this.currentUser.name = event.target.value;
    this.synchronizeIterate((user) => {
      if (this.currentUser.id === user.id) {
        user.name = this.currentUser.name;
      }
    });
    this.publish();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  deleteStory(id: string) {
    this.room.stories = this.room.stories.filter((str) => str.id !== id);
    this.publish();
  }

  private publish(): void {
    this.stompHandler.publish(this.room, this.currentUser);

  }

  kickUser(id: string) {
    this.room.users = this.room.users.filter((u) => u.id !== id);
    this.publish();
  }
}
