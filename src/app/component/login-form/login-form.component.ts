import { Component, OnInit } from '@angular/core';
import {User} from '../../model/user';
import {Router, ActivatedRoute} from '@angular/router';
import {Room} from '../../model/room';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit
{
  private cookieName = 'userNameCook';
  user = new User();
  room = new Room();
  constructor(private router: Router, private cookie: CookieService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.user.name = this.cookie.get(this.cookieName);
    this.route.queryParamMap.subscribe((queryMap) => {
      this.room.id = queryMap.get('roomId');
      if (this.room.id && this.user.name) {
        this.router.navigate(['/room', this.room.id, this.user.name]);
      }
    });
  }

  goToRoom() {
    const roomId = this.room.id ? this.room.id : Math.random().toString(36).substr(2, 9);
    this.cookie.set(this.cookieName, this.user.name);
    this.router.navigate(['/room', roomId, this.user.name]);
  }

}
