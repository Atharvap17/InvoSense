import { Component, OnInit } from '@angular/core';
import { AuthService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {

  constructor(private authservice: AuthService) { }

  ngOnInit(): void {
  }
  CLIENT_ID =
  "473119340255-ealunbq5k5k05c14s8qgoae0dkeifgg7.apps.googleusercontent.com";
  AUTHORIZE_URI = "https://accounts.google.com/o/oauth2/v2/auth";

  LoginWithGoogle(){
    // this.authservice.loadGoogleAuth()
    const url = `${this.AUTHORIZE_URI}?client_id=${this.CLIENT_ID}&redirect_uri=http://localhost:4200/callback&response_type=token&scope=https://www.googleapis.com/auth/userinfo.email`;
    window.location.href = url;
  }

}