import {Component, Inject, NgZone, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
//import {GoogleSigninServicee} from "../google/google-signin2.service";
import {FormControl} from "@angular/forms";
import {ReservationsListService} from "../reservation/reservations-list.service";
import {Reservation} from "../shared/reservation.model";
import {Time} from "@angular/common";
import {DataStorageService} from "../shared/data-storage.service";
import {GoogleApiService} from "../google/google-api.service";

export interface DialogData {
  name : string ;
  surname : string ;
  email : string ;
  number : string ;
  date: Date;
  hours: Time;
  treatment : string;
  loggedIn: boolean;
  insertion : boolean;
}
@Component({
  selector: 'app-dialog-summary',
  templateUrl: './dialog-summary.component.html',
  styleUrls: ['./dialog-summary.component.css']
})
export class DialogSummaryComponent implements OnInit {


  constructor(private dialogRefSummary: MatDialogRef<DialogSummaryComponent>,
              @Inject(MAT_DIALOG_DATA) private info: DialogData,
              private reservationService: ReservationsListService,
              private dataStorageService: DataStorageService,
              private google: GoogleApiService) { }

  ngOnInit(): void {
  }

  getInfo(): DialogData{
    return this.info;
  }

  // Close the dialog and if action is cancel delete the reservation
  onCloseDialog(action : string): void {
    if (action == 'cancel'){
      console.log("Da Eliminare")
      console.log(this.info.date)
      console.log(this.info.hours)
      let reservation = this.reservationService.getReservationFromDateHours(
        this.info.date,this.info.hours);
      this.reservationService.deleteReservation(reservation);
      this.dataStorageService.storeReservation(this.reservationService.getReservations());
    }
    this.dialogRefSummary.close();
  }

  // Save event in Google Calendar
  saveEvent(){
    var event = this.createEvent();
    console.log(this.getDate())
    //var event = this.createEvent();
    this.google.init(event)
      .then(() => {
        console.log("Evento inserito!");
        this.onCloseDialog('close');
      })
      .catch(() => {
        console.log("Inserimento evento fallito!");
        this.onCloseDialog('close');
      });
  }

  // Create event to be included in the Google calendar
  createEvent(): gapi.client.calendar.Event{
    var list = this.prepareDate(this.createDateForReservation());
    var event = {
      'summary': 'Appuntamento Hair Franco',
      'location': 'Viale Macallè, 10/C, 51100 Pistoia PT',
      'description': 'Prenotazione effettuata da webApp',
      'start': {
        'dateTime': list[0],  //'2022-02-22T09:00:00+01:00',
        'timeZone': 'Europe/Rome',
      },
      'end': {
        'dateTime': list[1], //'2022-02-22T9:30:00+01:00',
        'timeZone': 'Europe/Rome',
        },
    };
    return event;
  }

  // Prepare date in format (YYYY-MM-DDTHH:mm:ss.sssZ) for create event in google calendar
  prepareDate(date: Date): string[]{
    date.setHours(date.getHours() + 2);
    let isoStringStart = date.toISOString();
    date.getMinutes() == 0 ? date.setMinutes(30) : date.setMinutes(0) && date.setHours(date.getUTCHours()+1);
    let isoStringEnd = date.toISOString();
    let index = isoStringStart.indexOf('.')
    return [isoStringStart.substring(0,index),isoStringEnd.substring(0,index)]
  }

  // Returns a date created from the completed fields of the form
  createDateForReservation(): Date{
    return new Date(this.getDate().getFullYear(),
      this.getDate().getMonth(),
      this.getDate().getDate(),
      + this.getTime().hours,
      + this.getTime().minutes);
  }

  getName() : string{
    return this.info.name;
  }

  getSurname() : string{
    return this.info.surname;
  }

  getEmail() : string{
    return this.info.email;
  }

  getNumber() : string{
    return this.info.number;
  }

  getTreatment() : string{
    return this.info.treatment;
  }

  getDate(): Date{
     return this.info.date;
  }

  getTime(): Time{
    return this.info.hours;
  }

  getLoggedIn(): boolean{
    return this.info.loggedIn;
  }

  getInsertion(): boolean{
    return this.info.insertion;
  }

}
