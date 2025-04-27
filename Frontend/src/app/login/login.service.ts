import { Injectable } from '@angular/core';
declare var google: any;
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private clientId = 'Your client id';

  constructor() {
    // this.loadGoogleAuth();
  }

  loadGoogleAuth() {
    google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInBtn"),
        { theme: "outline", size: "large" }
      );
  }

  handleCredentialResponse(response: any) {
    const token = response.credential;
    console.log("Google Token:", token);
    // You can send this token to your backend for verification
  }
}