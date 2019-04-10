import { Component, OnInit } from '@angular/core';
import {User} from '../../model/user';
import {Router} from '@angular/router';
import {Room} from '../../model/room';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit
{
  user = new User();
  room = new Room();
  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToRoom(){
    this.router.navigate(['/room', this.room.id, this.user.name]);
  }

}
