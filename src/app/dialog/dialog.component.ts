import {ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Optional, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Treatment} from "../shared/treatment.model";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {TreatmentsListService} from "../treatments/treatments-list.service";
import {ReservationsListService} from "../reservation/reservations-list.service";
import {Reservation} from "../shared/reservation.model";
import {CalendarView} from "angular-calendar";
import {Subscription} from "rxjs";
import {DialogSummaryComponent} from "../dialog-summary/dialog-summary.component";
import {Time} from "@angular/common";
import {Holiday} from "../shared/holiday.model";
import {DataStorageService} from "../shared/data-storage.service";
import {GoogleApiService} from "../google/google-api.service";

type CalendarPeriod = 'day' | 'week' | 'month';

export interface DialogData {
  view : CalendarView;
  isAuthenticated: boolean;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit,OnDestroy {

  form: FormGroup;
  treatments: Treatment[];
  minDate : Date;
  maxDate : Date;

  name : FormControl ;
  surname : FormControl;
  email : FormControl ;
  number : FormControl ;
  date : FormControl ;
  hours : FormControl ;
  treatment : FormControl ;
  saveEvent: FormControl;

  reservations: Reservation[];
  holidays: Holiday[];
  reservationChangeSub: Subscription;
  holidayChangeSub: Subscription;
  clickedDate: Date;
  view: CalendarView | CalendarPeriod = CalendarView.Month;
  defaultDate : FormControl;
  time: string;

  hoursList : Time[] = []

  user !: gapi.auth2.GoogleUser | null;
  events !: gapi.client.calendar.Events [] | null;

  eventEntered: gapi.client.calendar.Event;
  userPicture: any;

  // Calendar
  calendarList: any;
  calendar: any;
  eventList: any;

  disabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<DialogComponent>,
    public dialog: MatDialog,
    private dialogRef1: MatDialogRef<DialogSummaryComponent>,
    private dialogRefCalendar: MatDialogRef<DialogSummaryComponent>,
    private treatmentsService: TreatmentsListService,
    private reservationService: ReservationsListService,
    // private signInService: GoogleSigninService,
    // private signInService1: GoogleSigninServicee,
    // private calendarService: CalendarService,
    // private googleService: GoogleService,
    //private calendarGoogleService: CalendarGoogleService,
    private ref: ChangeDetectorRef,
    private dataStorageService: DataStorageService,

    private google: GoogleApiService,
    @Optional() @Inject(MAT_DIALOG_DATA) public info: DialogData
  ) {

  }

  // Initialization
  ngOnInit() {
    this.view = this.info.view;

    //decommentare solo questo
    //this.signInService1.observable().subscribe(user => {
      //this.user = user;
      //this.ref.detectChanges();
      //console.log("Change :" + this.ref.detectChanges());
    //});

    // this.signInService1.observableEvent().subscribe(eventEntered => {
    //   this.eventEntered = eventEntered;
    //
    //   //console.log("Change :" + this.ref.detectChanges());
    // });

    // this.googleService.observable().subscribe(user => {
    //   this.user = user;
    //   //this.ref.detectChanges();
    //   //console.log("Change :" + this.ref.detectChanges());
    // });

    this.treatments = this.treatmentsService.getTreatmet();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getUTCDate();
    const daysInMonth = new Date(currentYear, currentMonth+2, 0).getDate();

    this.clickedDate = this.reservationService.getClickedDate();

    this.minDate = new Date(currentYear, currentMonth, currentDay);
    this.maxDate = new Date(currentYear, currentMonth + 1 , daysInMonth );

    this.reservations = this.reservationService.getReservations();
    this.reservationChangeSub = this.reservationService.reservationsChanged
      .subscribe(
        (reservations: Reservation[]) => {
          this.reservations = reservations;
        }
      );

    this.holidays = this.reservationService.getHolidays();
    this.holidayChangeSub = this.reservationService.holidaysChanged
      .subscribe(
        (holidays: Holiday[]) => {
          this.holidays = holidays;
        }
      );

    //this.time = '';
    this.createForm();
    this.uploadHours();


  }

  // Inizialize form
  createForm() : void{
    this.form = new FormGroup({
      'name' : new FormControl('', Validators.required),
      'surname' : new FormControl('', Validators.required),
      'email' : new FormControl('', [Validators.required, Validators.email]),
      'number' : new FormControl('',[Validators.required, Validators.pattern("^((\\+39-?)|0)?[0-9]{10}$")]),
      'date' : new FormControl(this.clickedDate, [Validators.required]),
      'hours' : new FormControl('', [Validators.required]),
      'treatment' : new FormControl('', [Validators.required]),
    });
  }

  // Filter the date, esclude monday and sunday
  myFilter = (d: Date): boolean => {
    if (d === null ){
      return ;
    }
    const day = d.getDay();
    //const day = this.form.value.date.getDay();
    // Prevent Saturday and Sunday from being selected.
    if (this.reservationService.getMondayWork()){
      return day !== 0 ;
    }
    return day!== 0 && day !== 1 &&
      this.reservationService.countReservation(d) !== this.reservationService.getMaxReservationForDay();
  }

  // Check if input date is today
  isToday(date: Date) : boolean{
    return (new Date().toLocaleDateString() === date.toLocaleDateString());
  }

  // Update the list of hours
  uploadHours(){
    this.hoursList = [];

    // Delete past times for the same day
    if(this.isToday(this.form.value.date) && new Date().getHours() >= 8){
      let d: Date = new Date();
      if (d.getMinutes() <= 20 ){
        this.hoursList.push({hours: d.getHours(), minutes:30});
        this.hoursList.push({hours: d.getHours()+1, minutes:0});
        this.hoursList.push({hours: d.getHours()+1, minutes:30});
      }
      if (d.getMinutes() > 20 && d.getMinutes() < 50){
        this.hoursList.push({hours: d.getHours()+1, minutes:0});
        this.hoursList.push({hours: d.getHours()+1, minutes:30});
      }
      (d.getMinutes() >= 50 ) ? this.hoursList.push({hours: d.getHours()+1, minutes:30}) : '';
      for (let i = d.getHours()+2; i < 21; i++) {
        this.hoursList.push({hours: i, minutes:0});
        this.hoursList.push({hours: i, minutes:30});
      }
    }
    else{
      for (let i = 8; i < 21; i++) {
        this.hoursList.push({hours: i, minutes:0});
        this.hoursList.push({hours: i, minutes:30});
      }
    }
    let time: Time;
    let index: number;
    // Delete the reserved times
    for (let i = 0; i < this.reservations.length; i++){
      if (this.form.value.date.toLocaleDateString() == this.reservations[i].getDate().toLocaleDateString()){
        time =  {hours: this.reservations[i].getDate().getHours(), minutes:this.reservations[i].getDate().getMinutes()}
        index = this.hoursList.indexOf(time);
        this.removeTime(this.reservations[i].getTime())
      }
    }
    // Delete closed shop hours
    for (let i = 0; i < this.holidays.length; i++){
      if (this.form.value.date.toLocaleDateString() == this.holidays[i].getDate().toLocaleDateString()){
        time =  this.holidays[i].getTime();
        index = this.hoursList.indexOf(time);
        this.removeTime(this.holidays[i].getTime())
      }
    }

    if (this.view === 'month' && this.hoursList.length !== 0){
      this.form.setValue({
        'name': this.form.value.name,
        'surname': this.form.value.surname,
        'email': this.form.value.email,
        'number': this.form.value.number,
        'date': this.form.value.date,
        'hours': this.hoursList[0],
        'treatment': this.form.value.treatment,
      });
    }else{
      this.form.setValue({
        'name': this.form.value.name,
        'surname': this.form.value.surname,
        'email': this.form.value.email,
        'number': this.form.value.number,
        'date': this.form.value.date,
        'hours': this.hoursList[this.indexTime({hours: this.clickedDate.getHours(), minutes: this.clickedDate.getMinutes()})],
        'treatment': this.form.value.treatment,
      });
    }
  }


  // Get the index of input time in the hour list
  indexTime(time: Time): number{
    for (let x of this.hoursList){
      if(x.hours === time.hours && x.minutes === time.minutes)
        return this.hoursList.indexOf(x);
    }
  }

  // Delete input time in the hour list
  removeTime(time: Time): void {
    for (let x of this.hoursList){
      if(x.hours === time.hours && x.minutes === time.minutes)
        this.hoursList.splice(this.hoursList.indexOf(x),1);
    }
  }

  // Upload list of hours when selected data change
  onDateChange(): void {
    this.uploadHours();
  }

  // Close the dialog
  onCloseDialog() {
    console.log("Chiudo il Dialog Prenotazione")
    this.dialogRef.close(this.form);
  }

  //
  onCancel(){
    console.log("Cliccato su ANNULLA")
    //console.log("disabled: ",this.form.disabled)
    // if(this.form.disabled){
    //   //this.google.revokeAllScopes();
    //   this.google.signOut();
    //
    // }
    this.form = null;
    this.onCloseDialog()
  }



  // Submit the form
  onSubmit() {
    console.log('Prenotazione Effettuata');
    console.log(this.form)

    this.form.markAllAsTouched();

    if(this.form.invalid) return;

    var res = new Reservation(
      this.form.value.name,
      this.form.value.surname,
      this.form.value.email,
      this.form.value.number,
      this.createDateForReservation(),
      this.form.value.treatment)

    console.log(res);
    this.reservationService.addReservation(res);
    this.dataStorageService.storeReservation(this.reservations);
    console.log(this.reservationService.getReservations());
    this.onCloseDialog();

    // Prenotazione da salvare su Google Calendar
    // if(this.form.value.saveEvent){
    //   this.disabled = true;
    //   this.form.disable();
    //
    //   var event = this.createEvent();
    //   this.google.init(event)
    //     .then(() => {
    //       console.log("Finito inserimento evento!");
    //       this.reservationService.addReservation(res);
    //       this.dataStorageService.storeReservation(this.reservations);
    //       this.onCloseDialog();
    //     })
    //     .catch(() => {
    //       console.log("inserimento evento fallito!");
    //       this.onCloseDialog();
    //     });
    // }
    // else{
    //
    // }


    //this.dialogRef.close(this.form.value);

    //this.openDialogSummary();

    //////this.onCloseDialog();


    //this.openDialogSummary();


    //console.log(this.reservationService.getReservations());
    //console.log(this.reservations);
  }


  prepare(){
    this.google.init({});
  }

  // //
  // disableForm(): void{
  //   this.disabled = true;
  //   this.form.disable();
  // }


  // getCalendarList() {
  //   this.calendarGoogleService.getCalendarList().then(
  //     (response) => {
  //       this.calendarList = response;
  //       console.log(this.calendarList);
  //     }
  //   )
  // }

  // Returns a date created from the completed fields of the form
  createDateForReservation(): Date{
    return new Date(this.form.value.date.getFullYear(),
      this.form.value.date.getMonth(),
      this.form.value.date.getDate(),
      + this.form.value.hours.hours,
      + this.form.value.hours.minutes);
  }


  // createEvent(): gapi.client.calendar.Event {
  //
  //   // let event = {
  //   //   'summary': 'Appuntamento Hair Franco',
  //   //   'location': 'Viale Macallè, 10/C, 51100 Pistoia PT',
  //   //   'description': 'Prenotazione effettuata da webApp',
  //   //   'start': {
  //   //     'dateTime': '2022-02-22T09:00:00+01:00',
  //   //     'timeZone': 'Europe/Rome',
  //   //   },
  //   //   'end': {
  //   //     'dateTime': '2022-02-22T10:00:00+01:00',
  //   //     'timeZone': 'Europe/Rome',
  //   //   },
  //   //   // 'recurrence': [
  //   //   //   'RRULE:FREQ=DAILY;COUNT=2'
  //   //   // ],
  //   //   // 'attendees': [
  //   //   //   {'email': 'lpage@example.com'},
  //   //   //   {'email': 'sbrin@example.com'},
  //   //   // ],
  //   //   // 'reminders': {
  //   //   //   'useDefault': false,
  //   //   //   'overrides': [
  //   //   //     {'method': 'email', 'minutes': 24 * 60},
  //   //   //     {'method': 'popup', 'minutes': 10},
  //   //   //   ],
  //   //   // },
  //   // };
  //   //let dateStart = ;
  //
  //   let event = {
  //     'summary': 'Appuntamento Hair Franco',
  //     'location': 'Viale Macallè, 10/C, 51100 Pistoia PT',
  //     'description': 'Prenotazione effettuata da webApp',
  //     'start': {
  //       'dateTime': this.prepareDate(this.createDateForReservation())[0],  //'2022-02-22T09:00:00+01:00',
  //       'timeZone': 'Europe/Rome',
  //     },
  //     'end': {
  //       'dateTime': this.prepareDate(this.createDateForReservation())[1],//'2022-02-22T10:00:00+01:00',
  //       'timeZone': 'Europe/Rome',
  //     },
  //   };
  //   return event;
  // }

  // prepareDate(date: Date):string[]{
  //   //console.log("-------------")
  //   date.setHours(date.getHours()+1);
  //   let isoStringStart = date.toISOString();
  //   date.getMinutes() == 0 ? date.setMinutes(30) : date.setMinutes(0) && date.setHours(date.getHours()+1);
  //   let isoStringEnd = date.toISOString();
  //   //console.log(isoStringStart);
  //   //console.log(isoStringEnd);
  //   let index = isoStringStart.indexOf('.')
  //   let indexEnd = isoStringEnd.indexOf('.')
  //   //console.log(index)
  //   //console.log([isoStringStart.substring(0,index),isoStringEnd.substring(0,index)])
  //   return [isoStringStart.substring(0,index),isoStringEnd.substring(0,index)]
  // }


  // Function to handle errors in form fields
  getErrorMessage(s : String): string {
    switch (s){
      case 'name':
        return (this.form.get('name').hasError('required')) ? 'Inserire un nome' : '';
      case 'surname':
        return (this.form.get('surname').hasError('required')) ? 'Inserire un cognome' : '';
      case 'email':
        return (this.form.get('email').hasError('required')) ? 'Inserire una mail.' : 'Email non valida.';
      case 'number':
        if (this.form.get('number').hasError('required')) return 'Inserire numero di cellulare.';
        if (this.form.get('number').hasError('pattern'))  return 'Inserire numero di cellulare valido.';
      case 'date':
        return (this.form.get('date').hasError('required')) ? 'Selezionare una data' : 'Data non valida';
      case 'hours':
        return (this.form.get('hours').hasError('required')) ? 'Selezionare un orario' : '';
      case 'treatment':
        return (this.form.get('treatment').hasError('required')) ? 'Selezionare un trattamento' : '';
    }


    // if (s == 'name')
    //   return (this.form.get('name').hasError('required')) ? 'Inserire un nome' : '';
    // if (s == 'surname')
    //   return (this.form.get('surname').hasError('required')) ? 'Inserire un cognome' : '';
    // if (s == 'email')
    //   return (this.form.get('email').hasError('required')) ? 'Inserire una mail.' : 'Email non valida.';
    // if (s == 'number'){
    //   if (this.form.get('number').hasError('required')) return 'Inserire numero di cellulare.';
    //   if (this.form.get('number').hasError('pattern'))  return 'Inserire numero di cellulare valido.';
    // }
    // if (s == 'date')
    //   return (this.form.get('date').hasError('required')) ? 'Selezionare una data' : 'Data non valida';
    // if (s == 'hours')
    //   return (this.form.get('hours').hasError('required')) ? 'Selezionare un orario' : '';
    // if (s == 'treatment')
    //   return (this.form.get('treatment').hasError('required')) ? 'Selezionare un trattamento' : '';
  }

  // resolveAfter2Seconds(x) {
  //   x = 5;
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve(x);
  //     }, 2000);
  //   });
  // }
  //
  // async getValueWithAsync() {
  //   const value = <number>await this.resolveAfter2Seconds(20);
  //   console.log(`async result: ${value}`);
  // }


  // signOut(){
  //   //this.signInService.signOut();
  // }

  // Close the subscriptions
  ngOnDestroy(): void {
    this.reservationChangeSub.unsubscribe();
  }

}
