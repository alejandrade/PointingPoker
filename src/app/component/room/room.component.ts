import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Room} from '../../model/room';
import {User} from '../../model/user';
import {Story} from '../../model/story';
import {StompHandlerService} from '../../service/stomp-handler.service';
import {CookieService} from 'ngx-cookie-service';
import {Observable, Subject, Subscription} from 'rxjs';
import {debounceTime, delay, map} from 'rxjs/operators';
import {distinctUntilChanged} from 'rxjs/internal/operators/distinctUntilChanged';
import {mergeMap} from 'rxjs/internal/operators/mergeMap';
import {of} from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {

  room: Room;
  currentUser: User;
  public keyUpStoryNameSubject = new Subject<KeyboardEvent>();
  public keyUpUsernameSubject = new Subject<KeyboardEvent>();

  private publishSubject = new Subject();
  private cookieName = 'userNameCook';
  private paramSubscribe: Subscription;
  private keyUpStoryNameSubcripton: Subscription;
  private keyUpUsernameSubscription: Subscription;
  private publishSubscription: Subscription;
  private stompConnection: Observable<any>;

  constructor(private route: ActivatedRoute,
              private stompHandler: StompHandlerService,
              private router: Router,
              private cookie: CookieService) {
  }

  ngOnInit() {
    this.environmentInit();

    this.keyUpStoryNameSubcripton = this.createDebounceForKeyboardEvent(this.keyUpStoryNameSubject)
      .subscribe((storyName) => this.updateStoryName(storyName));

    this.keyUpUsernameSubscription = this.createDebounceForKeyboardEvent(this.keyUpUsernameSubject)
      .subscribe((username) => this.updateUsername(username));

    this.publishSubscription = this.publishSubject.pipe(
      debounceTime(200)
    ).subscribe(() => this.stompHandler.publish(this.room, this.currentUser));
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


  ngOnDestroy(): void {
    this.paramSubscribe.unsubscribe();
    this.keyUpStoryNameSubcripton.unsubscribe();
    this.publishSubscription.unsubscribe();
  }

  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  deleteStory(id: string) {
    this.room.stories = this.room.stories.filter((str) => str.id !== id);
    this.publish();
  }

  kickUser(id: string) {
    this.room.users = this.room.users.filter((u) => u.id !== id);
    this.publish();
  }

  private updateStoryName(storyName): void {
    this.room.currentStory.storyName = storyName;
    this.publish();
  }

  private updateUsername(username): void {
    this.currentUser.name = username;
    this.synchronizeIterate((user) => {
      if (this.currentUser.id === user.id) {
        user.name = this.currentUser.name;
      }
    });
    this.publish();
  }

  private createDebounceForKeyboardEvent(sub: Subject<any>): any {
    return sub.pipe(
      map(event => (event.target as any).value),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      ))
    );
  }

  private environmentInit() {
    this.paramSubscribe = this.route.params.subscribe((param) => {
      this.room = new Room(param.roomId, new Story(this.generateUniqueId()));
      this.currentUser = new User(this.generateUniqueId(), this.cookie.get(this.cookieName));
      this.room.users.push(this.currentUser);
      this.stompConnection = this.stompHandler
        .initializeWebSocketConnection(this.room, this.currentUser);
      this.stompConnection.subscribe((webSocket) => this.updateRoom(webSocket.room));
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
      this.disconectAction();
    }
  }

  private disconectAction(): void {
    alert('You have been disconnected!');
    this.router.navigate(['/']);
  }

  private checkIfAllUsersVotes(users: Array<User>): void {
    if (users != null) {
      const everyUserVoted = users.every((user) => !!user.vote || user.spectator);

      if (everyUserVoted && !this.room.showVotes) {
        this.showVotes(true);
      }
    }
  }

  private publish(): void {
    this.publishSubject.next();
  }
}
