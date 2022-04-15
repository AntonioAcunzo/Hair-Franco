import {Injectable, NgZone, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {
  private auth: gapi.auth2.GoogleAuth;
  private user: gapi.auth2.GoogleUser;
  public subject = new ReplaySubject<gapi.auth2.GoogleUser>(1);

  private client_id = '1013289881880-6ohsr0gifh1orkob4reltftb9634e43d.apps.googleusercontent.com'
  private apyKey = 'AIzaSyDe1Iz7m0aqxvl7aJOFgEVR6y2SpdX57D4'
  private discoveryDocs = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private scope = 'https://www.googleapis.com/auth/calendar';

  constructor(private zone: NgZone) {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: this.apyKey,
        clientId: this.client_id,
        discoveryDocs: [this.discoveryDocs],
        scope: this.scope,
      });
    });

  }

  // Prepare the use of google api
  public init(event: gapi.client.calendar.Event):Promise<any>{
    return new Promise( (resolve,reject) => {
      this.auth = gapi.auth2.getAuthInstance();
      this.loginForUser(event)
        .then(
          function (response) {
            resolve(response);
          }
        )
        .catch(() => {
          console.log("POPUP login Chiuso");
          reject();
        });
      console.log("Client id caricato")
    });
  }

  // Open the Google login dialog for sign in
  loginForUser(event: gapi.client.calendar.Event ): Promise<gapi.auth2.GoogleUser> {
    return this.zone.run(() => {
      return this.auth.signIn({
        scope: this.scope
      }).then(user => {
          console.log("Login effettuato");
          console.log("User: " + user);
          this.user = user;
          this.insertEvent(user,event)
          return user;
        });
    });
  }

  signOut(){
    this.auth.signOut().then( () => {
      this.subject.next(null);
      this.user.disconnect();
      console.log("Logout!")
    });
  }

  revokeAllScopes() {
    this.auth.disconnect();
  }

  // Create and Insert event
  public insertEvent(user: gapi.auth2.GoogleUser, event: gapi.client.calendar.Event ): Promise<gapi.client.calendar.Event>{
    var event1 = {
      'summary': 'Appuntamento Hair Franco',
      'location': 'Viale Macallè, 10/C, 51100 Pistoia PT',
      'description': 'Prenotazione effettuata da webApp',
      'start': {
        'dateTime': '2022-03-19T09:00:00+01:00',
        'timeZone': 'Europe/Rome',
      },
      'end': {
        'dateTime': '2022-03-19T10:00:00+01:00',
        'timeZone': 'Europe/Rome',
      },
    };
    return new Promise( resolve => {
      gapi.client.calendar.events.insert({
        oauth_token : user.getAuthResponse().access_token,
        calendarId: 'primary',
        resource: event
      }).then(function (response) {
        resolve(response.result)
        console.log(response.result);
      })
    });
  }


}
