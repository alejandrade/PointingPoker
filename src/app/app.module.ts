import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { LoginFormComponent } from './component/login-form/login-form.component';
import { PointingPokerRoutingModule } from './module/pointing-poker-routing.module';
import { RoomComponent } from './component/room/room.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CookieService } from 'ngx-cookie-service';
import {BsDropdownModule} from 'ngx-bootstrap';
import { OcticonDirective } from './directives/octicon.directive';


@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    RoomComponent,
    OcticonDirective
  ],
  imports: [
    BrowserModule,
    ButtonsModule.forRoot(),
    FormsModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    PointingPokerRoutingModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
