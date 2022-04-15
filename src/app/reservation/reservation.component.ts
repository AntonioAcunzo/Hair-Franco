import {
  Component,
  EventEmitter, NgZone, OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarMonthViewDay,
  CalendarWeekViewBeforeRenderEvent,
  CalendarView,
  DAYS_OF_WEEK,
  CalendarEventAction
} from "angular-calendar";
import {CustomDateFormatter} from 'src/app/reservation/custom-date-formatter.provider';
import {Subject} from "rxjs/Subject";
import {TreatmentsListService} from "../treatments/treatments-list.service";
import {Reservation} from "../shared/reservation.model";
import {ReservationsListService} from "./reservations-list.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormGroup} from "@angular/forms";
import {DialogComponent} from "../dialog/dialog.component";
import {
  subMonths,
  addMonths,
  addDays,
  addWeeks,
  subDays,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from 'date-fns';
import {Subscription} from "rxjs";
import {DialogSummaryComponent} from "../dialog-summary/dialog-summary.component";
import {AuthService} from "../auth/auth.service";
import {Holiday} from "../shared/holiday.model";
import {DialogCalendarComponent} from "../dialog-calendar/dialog-calendar.component";
import {DataStorageService} from "../shared/data-storage.service";



type CalendarPeriod = 'day' | 'week' | 'month';

// Function for

function addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths,
  }[period](date, amount);
}

function subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: subDays,
    week: subWeeks,
    month: subMonths,
  }[period](date, amount);
}

function startOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth,
  }[period](date);
}

function endOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: endOfDay,
    week: endOfWeek,
    month: endOfMonth,
  }[period](date);
}

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
})
export class ReservationComponent implements OnInit, OnDestroy {

  private modalData: {
    action: string;
    event: CalendarEvent;
  };

  view: CalendarView | CalendarPeriod = CalendarView.Month;

  viewDate: Date = new Date();

  minDate : Date;

  maxDate : Date;

  currentDate : Date;

  prevBtnDisabled: boolean = true;

  nextBtnDisabled: boolean = false;

  @Output() viewChange = new EventEmitter<CalendarView>();

  @Output() viewDateChange = new EventEmitter<Date>();

  CalendarView = CalendarView;

  events: CalendarEvent[] = [
    {
      title: 'An event',
      start: new Date(),
    },
  ];

  locale: string = 'it-IT';

  // Exclude weekends
  excludeDays: number[] = [0]; // insert 1 for remove monday from calendar

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.SUNDAY];

  clickedDate: Date;

  clickedColumn: number;

  startHour: number = 8;

  endHour: number = 20;

  daysInWeek = 7;

  reservations: Reservation[];
  holidays: Holiday[];
  reservationChangeSub: Subscription;
  holidayChangeSub: Subscription;
  reservationLoadSub: Subscription;
  holidayLoadSub: Subscription;

  mondayWork: boolean;

  refresh = new Subject<void>();
  refreshWeek = new Subject<void>();

  eventEntered: gapi.client.calendar.Event;

  resultForm: FormGroup;

  isAuthenticated : boolean = false;
  private userSub : Subscription;

  dialogRef: MatDialogRef<DialogComponent>;
  dialogSummary: MatDialogRef<DialogSummaryComponent>;
  dialogCalendar: MatDialogRef<DialogCalendarComponent>;

  titleHoliday : string;

  prevHours: number;

  user : gapi.auth2.GoogleUser;
  insertion: boolean;
  actions: CalendarEventAction[];

  headerDays: string[];
  mobile: boolean;


  constructor(private reservationService: ReservationsListService,
              private treatmentsService: TreatmentsListService,
              private dialog: MatDialog,
              private dialogSummary1: MatDialog,
              private ngZone: NgZone,
              private authService : AuthService,
              private dataStorageService: DataStorageService,
              ) { }

  ngOnInit() {

    this.onWindowResize();

    //this.headerDays = ["Lun","Mar","Merc","Gio","Ven","Sab"];
    this.titleHoliday= new Holiday(new Date()).getInfo();
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !user ? false : true;
    });


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

    this.reservationLoadSub = this.reservationService.reservationsLoaded
      .subscribe(() => {
        this.refreshView();
        this.refreshEvent()
      });

    this.holidayLoadSub = this.reservationService.holidaysLoaded
      .subscribe(() => {
            this.refreshView();
            this.refreshEvent()
      });


    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getUTCDate();
    const daysInMonth = new Date(currentYear, currentMonth+2, 0).getDate();
    this.minDate = new Date(currentYear, currentMonth, currentDay);
    this.maxDate = new Date(currentYear, currentMonth + 1 , daysInMonth, 23,59);
    console.log("max : " + this.maxDate)
    this.currentDate = new Date();
    this.mondayWork = this.reservationService.getMondayWork();
    this.refreshEvent();
    this.refreshView();

    this.insertion = false;

    this.actions = [
      {
        label: "<i class=\"bi bi-trash\"></i>",
        a11yLabel: 'Delete',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.handleEvent('Delete', event);
        },
      },
    ];


  }

  // Function to recognize the screen from which the web app is running
  onWindowResize() {
    (window.screen.width < 575)
      ? this.mobile = true
      : this.mobile = false;
  }

  // Function for the number of free slot in a day
  freeSlot(date: Date): number{
    return this.reservationService.getMaxReservationForDay() - this.reservationService.countReservationOfDay(date)
    - this.reservationService.countHolidayOfDay(date) - this.reservationService.countPrevHoursOfDay(date)
  }


  // countPrevHours(date: Date): number{
  //   let count = 0;
  //   let currentDate = new Date();
  //   if(date.toLocaleDateString() === currentDate.toLocaleDateString()
  //   && currentDate.getHours() >= 8){
  //     count = (currentDate.getHours() - this.startHour) * 2;
  //     if (currentDate.getMinutes() <= 20 ) count++;
  //     if (currentDate.getMinutes() > 20 && currentDate.getMinutes() <50) count+=2;
  //     if (currentDate.getMinutes() > 50 ) count--;
  //   }
  //   return count;
  //
  // }

  // checkChanges(){
  //   console.log("Variabile event entered cambiata");
  //   console.log(this.eventEntered);
  //   this.openDialogSummary();
  // }


  // today(): void {
  //   this.changeDate(new Date());
  // }

  //
  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarPeriod): void {
    this.view = view;
    //this.reservationService.setView(view);
    this.refreshEvent()
    this.refreshView();
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
    );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  increment(): void {
    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  }

  dateChanged(dateClicked: Date) {
    //console.log('Setto data a '+ dateClicked);
    this.clickedDate = dateClicked;
    this.reservationService.setClickedDate(dateClicked);
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      // console.log("Data calensario " + day.date)
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }else{
        // if (day.date.getDate() == this.currentDate.getDate() &&
        //   day.date.getMonth() == this.currentDate.getMonth()){
        if (day.date.toLocaleDateString() === this.currentDate.toLocaleDateString()){
          // console.log('è oggi');
          day.cssClass = 'today';
        }
        //console.log(this.reservationService.getMaxReservationForDay())
        // if(this.reservationService.countReservationOfDay(day.date) === this.reservationService.getMaxReservationForDay()){
        //   console.log("Pieno")
        //   day.cssClass = 'bg-red';
        // }
        // console.log(day.date)
        // console.log(this.freeSlot(day.date))
        if(this.freeSlot(day.date) === 0){
          // console.log("ROSSO")
          day.cssClass = 'bg-red';
        }else{
          // this.reservationService.countReservationOfDay(day.date) > this.reservationService.getMaxReservationForDay()/2
          this.freeSlot(day.date) <= 10
            ? day.cssClass = 'bg-yellow': '' ;
        }
      }
      if ((day.date.getDay() === 1 && !this.mondayWork) || day.date.getDay() === 0){
        day.cssClass = 'cal-disabled';
      }
    });
  }

  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    //console.log(renderEvent.period);
    //console.log(renderEvent.allDayEventRows);
    //console.log(renderEvent.header);
    renderEvent.hourColumns.forEach((hourColumn) => {
      //console.log(hourColumn);
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          //console.log(segment.date.getDay());
          if(this.dateIsValid(segment.date)){
            if ((segment.date.getDay() === 1 && !this.mondayWork) || segment.date.getDay() === 0) {
              segment.cssClass = 'cal-disabled';
            }else {
              // this.checkReservation(segment.date) ? segment.cssClass = 'bg-red': '';
            }

          }
          if (!this.dateIsValid(segment.date) ||
            (segment.date.getTime()  <= this.currentDate.getTime() + 600000 &&
              segment.date.getUTCDay() == this.currentDate.getUTCDay())) {
            segment.cssClass = 'cal-disabled';
          }
        });
      });
    });
  }





  checkReservation(date : Date){
    for (let reservation of this.reservations) {
      if (reservation.getDate().getTime() === date.getTime()){
        return true;
      }
      // if(reservation.getDate().getMonth() == date.getMonth() &&
      //   reservation.getDate().getDate() == date.getDate() &&
      //   reservation.getDate().getHours() == date.getHours() &&
      //   reservation.getDate().getMinutes() == date.getMinutes()){
      //       return true;
      //     }
    }

    // for(let i = 0; i < this.reservationService.getReservations().length; i++){
    //    console.log('Mese: ' + this.reservations[i].getDate().getMonth() + ' - '+ date.getMonth());
    //    console.log('Giorno: ' + this.reservations[i].getDate().getUTCDate() + ' - '+ date.getDate());
    //    console.log('Ora: ' + this.reservations[i].getDate().getHours() + ' - '+ date.getHours());
    //    console.log('Minuti: ' + this.reservations[i].getDate().getMinutes() + ' - '+ date.getMinutes());
    //
    //   if(this.reservationService.getReservations()[i].getDate().getMonth() == date.getMonth() &&
    //     this.reservationService.getReservations()[i].getDate().getDate() == date.getDate() &&
    //     this.reservationService.getReservations()[i].getDate().getHours() == date.getHours() &&
    //     this.reservationService.getReservations()[i].getDate().getMinutes() == date.getMinutes()){
    //     return true;
    //   }
    // }
    return false;
  }

  checkHoliday(date : Date){
    for (let holiday of this.holidays) {
      if (holiday.getDate().getTime() === date.getTime()){
        return true;
      }
    }
    return false;
  }

  //Click su prenotazione se loggato
  handleEvent(action: string, event: CalendarEvent): void {
    console.log("Handle")
    console.log(action)
    //console.log("Cliccato su slot occupato")
    if(!this.isAuthenticated) return;
    if (event.title === this.titleHoliday && action === 'Delete'){
      console.log("Cliccato su vacanza")
      this.reservationService.deleteHoliday(new Holiday(event.start));
      this.dataStorageService.storeHoliday(this.holidays);
      console.log(this.holidays)
      this.refreshEvent();
      this.refreshView();
    }
    if (event.title !== this.titleHoliday){
      console.log("Cliccato su prenotazione")
      this.reservationDetails(event);
    }
  }

  openDialog(date : Date) {

    // Data non valida o passata
    if (!this.dateIsValid(date) || (date.getTime()  <= this.currentDate.getTime() + 600000 &&
      date.getUTCDay() === this.currentDate.getUTCDay())) {
      return;
    }

    // Lunedì o Domenica o nessuno slot disponibile
    if (date.getDay() === 1 || date.getDay() === 0
      || this.freeSlot(date) === 0 ) {
      return;
    }

    let h;
    (this.mobile) ?  h = '70vh' : h = '75vh';
    this.insertion = true;
    this.dialogRef = this.dialog.open(DialogComponent, {
      height: h,
      width: '80vw',
      backdropClass: 'cdk-overlay-dark-backdrop',
      data : {
        view: this.view,
        isAuthenticated : this.isAuthenticated
      }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      //console.log("After Closed : ");
      // console.log(result);
      this.resultForm = result;
      this.refreshEvent();
      this.refreshView();
      if (result !== null && result !== undefined) this.openDialogSummary();

      //this.openDialogCalendar();
      //this.openDialogSummary();
      this.insertion = false;

    });

  }

  reservationDetails(event: CalendarEvent){
    let reservation = this.reservations[event.id];
    this.dialogSummary = this.dialog.open(DialogSummaryComponent,{
      disableClose: false,
      height: '55vh',
      width: '75vw',
      data : {
        name : reservation.getName(),
        surname : reservation.getSurname(),
        email : reservation.getEmail(),
        number : reservation.getNumber(),
        date : reservation.getDate(),
        hours: reservation.getTime(),
        treatment : reservation.getTreatment(),
        loggedIn: this.isAuthenticated,
        insertion: this.insertion
      }
    });
    this.dialogSummary.afterClosed().subscribe(() => {
      this.refreshEvent();
      this.refreshView();
    });
  }

  openDialogSummary(){

    this.dialogSummary = this.dialog.open(DialogSummaryComponent,{
          disableClose: true,
          height: '75vh',
          width: '80vw',
          data : {
            name : this.resultForm.value.name,
            surname : this.resultForm.value.surname,
            email : this.resultForm.value.email,
            number : this.resultForm.value.number,
            date : this.resultForm.value.date,
            hours: this.resultForm.value.hours,
            treatment : this.resultForm.value.treatment,
            loggedIn: this.isAuthenticated,
            insertion: this.insertion
          }
        });
    this.dialogSummary.afterClosed().subscribe(() => {
      this.refreshEvent();
      this.refreshView();
    });

  }

  // openDialogCancel(){
  //   this.dialogCancel = this.dialog.open(DialogCancelComponent, {
  //     height: '75vh',
  //     width: '60vw',
  //     backdropClass: 'cdk-overlay-dark-backdrop',
  //   });
  //
  //   this.dialogCancel.afterClosed().subscribe(() => {
  //     this.refreshEvent();
  //     this.refreshView();
  //   });
  //
  // }

  refreshView(): void {
    console.log("Refresh View");
    this.refresh.next();
    this.refreshWeek.next();
  }

  refreshEvent(): void{
    console.log("Refresh Event");

    this.reservationService.updateDatabase();

    this.events = [];

    for (let reservation of this.reservations) {
      if(this.isAuthenticated && this.view != 'month'){
        this.events.push({
          id: this.reservations.indexOf(reservation),
          title: reservation.getInfo(),
          start: reservation.getDate(),
          color: {
            primary: "#1e90ff",
            secondary: "#D1E8FF"
          },
        });
      }else{
        this.events.push({
          title: 'Prenotato',
          start: reservation.getDate(),
          color: {
            primary: "#1e90ff",
            secondary: "#D1E8FF"
          },
        });
      }

    }

    for (let holiday of this.holidays) {
      this.events.push({
        title: holiday.getInfo(),
        start: holiday.getDate(),
        color: {
          primary: "#1e90ff",
          secondary: "#D1E8FF"
        },
        actions: (this.isAuthenticated) ? this.actions: []
      });



    }



  }



  ngOnDestroy() {
    this.userSub.unsubscribe();
  }




}

