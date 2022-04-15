import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../auth/auth.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {Time} from "@angular/common";
import {ReservationsListService} from "../reservation/reservations-list.service";
import {Reservation} from "../shared/reservation.model";
import {Holiday} from "../shared/holiday.model";
import {DataStorageService} from "../shared/data-storage.service";

@Component({
  selector: 'app-change-calendar',
  templateUrl: './change-calendar.component.html',
  styleUrls: ['./change-calendar.component.css']
})
export class ChangeCalendarComponent implements OnInit,OnDestroy {

  formClosure: FormGroup;
  startDateClose: FormControl;
  endDateClose: FormControl;
  startTimeClose: FormControl;
  endTimeClose: FormControl;

  formOpening: FormGroup;
  startDateOpen: FormControl;
  endDateOpen: FormControl;
  startTimeOpen: FormControl
  endTimeOpen: FormControl;

  minDate: Date;
  maxDate: Date;

  matStartDate: Date;
  matEndDate: Date;

  startClosure: Date;
  endClosure: Date;
  startOpening: Date;
  endOpening: Date;

  clickedDate: Date;
  hoursList: Time[] = [];
  hoursListEnd: Time[] = [];

  disableStart: boolean;
  disableEnd: boolean;

  reservations: Reservation[];
  holidays: Holiday[];
  reservationChangeSub: Subscription;
  holidayChangeSub: Subscription;

  insertedMessage: string;
  removedMessage: string;

  isAuthenticated : boolean;
  userSub : Subscription;

  constructor(private formBuilder: FormBuilder,
              private authService : AuthService,
              private router: Router,
              private reservationService: ReservationsListService,
              private dataStorageService: DataStorageService
              ) { }

  // Initialization
  ngOnInit(): void {

    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !user ? false : true;
    });

    if (!this.isAuthenticated) this.router.navigate(['/login']);

    //this.reservations = this.reservationService.getReservations();
    //this.holidays = this.reservationService.getHolidays();
    // this.reservations = this.reservationService.getReservations();
    // this.reservationChangeSub = this.reservationService.reservationsChanged
    //   .subscribe(
    //     (reservations: Reservation[]) => {
    //       this.reservations = reservations;
    //     }
    //   );

    this.holidays = this.reservationService.getHolidays();
    this.holidayChangeSub = this.reservationService.holidaysChanged
      .subscribe(
        (holidays: Holiday[]) => {
          this.holidays = holidays;
        }
      );

    this.minDate = new Date();
    this.maxDate = new Date(this.minDate.getFullYear()+1, this.minDate.getMonth(), this.minDate.getUTCDate());

    this.disableStart = true;
    this.disableEnd = true;
    // this.insertedMessage = 'Negozio già chiuso o prenotazioni presenti nel periodo selezionato.' +
    //   ' Rimuoverli per inserire una nuova chiusura del negozio!';
    // this.removedMessage = 'Nessuna chiusura rimossa!';
    this.insertedMessage = null;
    this.removedMessage = null;

    this.hoursListEnd = [];
    this.hoursList = [{hours:0, minutes:0}];
    for (let i = 8; i < 21; i++) {
      this.hoursList.push({hours:i, minutes:0});
      this.hoursList.push({hours:i, minutes:30});
    }

    this.formClosure = new FormGroup({
      'startDateClose' : new FormControl('', [Validators.required]),
      'endDateClose' : new FormControl('', [Validators.required]),
      'startTimeClose' : new FormControl({value: '', disabled: true}, [Validators.required]),
      'endTimeClose' : new FormControl({value: '', disabled: true}, [Validators.required]),
    });

    this.formOpening = new FormGroup({
      'startDateOpen' : new FormControl('', [Validators.required]),
      'endDateOpen' : new FormControl('', [Validators.required]),
      'startTimeOpen' : new FormControl({value: '', disabled: true}, [Validators.required]),
      'endTimeOpen' : new FormControl({value: '', disabled: true}, [Validators.required]),
    });

    this.formClosure.get('startDateClose').valueChanges.subscribe(res=>{
      this.startClosure = res;
    });
    this.formClosure.get('endDateClose').valueChanges.subscribe(res=>{
      this.endClosure = res;
      this.onDateChange(
        this.formClosure,
        this.startClosure,
        this.endClosure,
        'startTimeClose',
        'endTimeClose');
    });

    this.formOpening.get('startDateOpen').valueChanges.subscribe(res=>{
      this.startOpening = res;
    });
    this.formOpening.get('endDateOpen').valueChanges.subscribe(res=>{
      this.endOpening = res;
      this.onDateChange(
        this.formOpening,
        this.startOpening,
        this.endOpening,
        'startTimeOpen',
        'endTimeOpen');
    });

  }

  // Filter the date, esclude monday and sunday
  myFilter = (d: Date): boolean => {
    if (d === null ){
      return ;
    }
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    if (this.reservationService.getMondayWork()){
      return day !== 0 ;
    }
    return day!== 0 && day !== 1 &&
      this.reservationService.countReservation(d) !== this.reservationService.getMaxReservationForDay();
  }

  // Update the list of hours
  updateHours(): void{
    for (let i=this.hoursList.length-1; i>=0; i--) {
      if (this.hoursList[i].hours < new Date().getHours() && this.hoursList[i].hours !== 0
      || (this.hoursList[i].hours === new Date().getHours() && this.hoursList[i].minutes < new Date().getMinutes()))
        this.hoursList.splice(i,1);
    }
  }

  // Function that enables the time fields after entering the date in the form
  onDateChange(form: FormGroup, startD: Date, endD: Date, startT: string, endT: string): void {

    this.insertedMessage = null;
    this.removedMessage = null;
    if (startD != null && endD != null){
      if (startD.toLocaleDateString() === new Date().toLocaleDateString()) this.updateHours();
      form.get(startT).enable();
      if(startD.toLocaleDateString() !== endD.toLocaleDateString()){
        form.get(endT).setValue('');
        form.get(endT).disable();
      }
      form.get(startT).setValue(this.hoursList[0]);
    }

  }

  // onDateChangeClosure(): void {
  //   this.insertedMessage = null;
  //   this.removedMessage = null;
  //   if (this.startClosure != null && this.endClosure != null){
  //     if (this.startClosure.toLocaleDateString() === new Date().toLocaleDateString()) this.updateHours();
  //     this.formClosure.get('startTimeClose').enable();
  //     if(this.startClosure.toLocaleDateString() !== this.endClosure.toLocaleDateString()){
  //       this.formClosure.get('endTimeClose').disable();
  //     }
  //     this.formClosure.get('startTimeClose').setValue(this.hoursList[0]);
  //   }
  // }
  //
  // onDateChangeOpening(): void {
  //   this.insertedMessage = null;
  //   this.removedMessage = null;
  //   if (this.startOpening != null && this.endOpening != null){
  //     this.formOpening.get('startTimeOpen').enable()
  //     if(this.startOpening.toLocaleDateString() !== this.endOpening.toLocaleDateString()){
  //       this.formOpening.get('endTimeOpen').disable();
  //     }
  //     this.formOpening.get('startTimeOpen').setValue(this.hoursList[0]);
  //   }
  //
  // }

  // Function that enables the end time field after entering the start time field in the form
  onTimeChange(form: FormGroup, startT: string, endT: string): void{

    this.insertedMessage = null;
    this.removedMessage = null;
    if (form.get(startT).value === this.hoursList[0]){
      form.get(endT).setValue('');
      form.get(endT).disable();
    }else form.get(endT).enable();
    this.hoursListEnd = [{hours:0, minutes:0}];
    let index = this.hoursList.indexOf(form.controls[startT].value);
    for (let i = index+1; i < this.hoursList.length; i++) {
      this.hoursListEnd.push(this.hoursList[i]);
    }

  }

  // onTimeChangeClosure(): void{
  //   this.insertedMessage = null;
  //   this.removedMessage = null;
  //   if (this.formClosure.value.startTimeClose === this.hoursList[0]){
  //     this.formClosure.controls['endTimeClose'].setValue('-');
  //     this.formClosure.get('endTimeClose').disable();
  //   }else this.formClosure.get('endTimeClose').enable();
  //   this.hoursListEnd = [{hours:0, minutes:0}];
  //   let index = this.hoursList.indexOf(this.formClosure.value.startTimeClose);
  //   for (let i = index+1; i < this.hoursList.length; i++) {
  //     this.hoursListEnd.push(this.hoursList[i]);
  //   }
  // }
  //
  // onTimeChangeOpening(): void{
  //   this.insertedMessage = null;
  //   this.removedMessage = null;
  //   if (this.formOpening.value.startTimeOpen === this.hoursList[0]){
  //     this.formOpening.get('endTimeOpen').disable();
  //     this.formOpening.controls['endTimeOpen'].setValue('');
  //   }else this.formOpening.get('endTimeOpen').enable();
  //   this.hoursListEnd = [{hours:0, minutes:0}];
  //   let index = this.hoursList.indexOf(this.formOpening.value.startTimeOpen);
  //   console.log(index)
  //   for (let i = index+1; i < this.hoursList.length; i++) {
  //     this.hoursListEnd.push(this.hoursList[i]);
  //   }
  // }

  // Check if there are bookings in the selected time period
  checkFreeTime(dateStart: Date, dateEnd: Date, hoursStart: Time, hoursEnd: Time): boolean{
    let date = new Date(dateStart.getFullYear(),dateStart.getMonth(),dateStart.getDate()-1);
    while(date.toLocaleDateString() !== dateEnd.toLocaleDateString()) {
      date = new Date(date.getFullYear(),date.getMonth(),date.getDate()+1);
      console.log("Controllo possibili prenotazioni su data :", date.toLocaleDateString())
      if (hoursStart.hours === 0 && hoursStart.minutes === 0) {
        console.log("Tutto il giorno");
        if(this.reserved(date,null,null)){
          return false;
        }
      }
      else{
        console.log("Spezzone orario")
        if(this.reserved(date, hoursStart, hoursEnd)) {
          return false;
        }
      }
    }
    console.log("return true")
    return true ;
  }

  // Function that cycles for the period of selected dates
  insertHoliday(){
    this.formClosure.markAllAsTouched();
    if (this.formClosure.invalid) return;
    console.log("Inserisco Chiusura");

    if(this.checkFreeTime(this.startClosure, this.endClosure,
      this.formClosure.get('startTimeClose').value,
      this.formClosure.get('endTimeClose').value)) {
      console.log("Posto Libero");
      if (this.startClosure.toLocaleDateString() === this.endClosure.toLocaleDateString()) {
        this.insertForDay(this.startClosure);
      }
      else {
        let date = new Date(this.startClosure.getFullYear(), this.startClosure.getMonth(), this.startClosure.getDate() - 1);
        console.log("data partenza: ", date.toLocaleDateString());
        console.log(this.endClosure.toLocaleDateString());
        while (date.toLocaleDateString() !== this.endClosure.toLocaleDateString()) {
          date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          console.log("Aggiungo per data: ", date.toLocaleDateString())
          this.insertForDay(date);
        }
      }
      console.log(this.holidays)
      this.dataStorageService.storeHoliday(this.holidays);
      // let element = document.getElementById('insertMessage');
      // element.className = 'alert alert-primary error';
    }else{
      this.insertedMessage = 'Impossibile inserire chiusure, negozio già chiuso o prenotazioni presenti nel periodo selezionato.' +
        ' Rimuoverli per inserire una nuova chiusura del negozio!';
    }
  }

  // Insert a holiday in the selected date
  insertForDay(date: Date) : void {
    let inserted = 0;
    if (this.formClosure.get('startTimeClose').value.hours === 0
      && this.formClosure.get('startTimeClose').value.minutes === 0){
      console.log("Giorno intero")
      console.log("Inserted : ",inserted)
      inserted = this.reservationService.addHolidayDay(date);
    }else{
      console.log("Spezzoni orario")
      //console.log(this.formClosure.get('endTime').value)
      inserted += this.reservationService.addHolidayTime(date, this.formClosure.get('startTimeClose').value, this.formClosure.get('endTimeClose').value);
      // if(inserted === 0) this.insertedMessage = 'Nessuna chiusura del negozio inserito!';
      // if(inserted === 1) this.insertedMessage = 'Inserito ' + inserted + ' orario di chiusura del negozio!';
      // else this.insertedMessage = 'Inseriti ' + inserted + ' orari di chiusura del negozio!'
    }
    if(inserted === 0) this.insertedMessage = 'Nessuna chiusura del negozio inserita!';
    // if(inserted === 1) this.insertedMessage = 'Chiusura del negozio inserita!';
    else this.insertedMessage = 'Negozio chiuso nel periodo selezionato!';
  }

  // Check if there are reservations in the date and time selected
  reserved(date : Date, hoursStart: Time, hoursEnd: Time): boolean{
    if (hoursStart === null && hoursEnd === null)
      return (this.reservationService.unavailableFromDate(date) === null) ? false: true;
    return (this.reservationService.unavailableFromTime(date, hoursStart, hoursEnd) === null) ? false: true;
  }

  // Function that cycles for the period of selected dates
  removeHoliday(): void{
    this.formOpening.markAllAsTouched();
    let removed=0;
    if (this.formOpening.invalid) return;
    console.log("Rimuovo Chiusura");
    let holiday : Holiday;
    if (this.formOpening.get('startTimeOpen').value.hours === 0){
      console.log("Tutto il giorno : ");
      removed = this.removeForDay(this.startOpening,this.endOpening,null);
    }else{
      console.log("Fascia oraria");
      this.hoursList.forEach( (item, index) => {
        //console.log(item);
        if(this.isBetween(this.formOpening.get('startTimeOpen').value, this.formOpening.get('endTimeOpen').value, item)){
          removed += this.removeForDay(this.startOpening,this.endOpening,item);
        }
      });
    }
    this.dataStorageService.storeHoliday(this.holidays);
    if(removed === 0) this.removedMessage = 'Nessuna chiusura rimossa!';
    //if(removed === 1) this.removedMessage = 'Rimossa una chiusura del negozio!';
    else this.removedMessage = 'Negozio aperto nel periodo selezionato!'

  }



  // Remove a holiday in the selected date
  removeForDay(startDate: Date, endDate: Date, time: Time): number{
    let holiday: Holiday;
    let count = 0;
    let date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 1);
    while (date.toLocaleDateString() !== endDate.toLocaleDateString()) {
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      console.log("Lavoro su data: ", date);
      if(time !== null){
        date.setHours(time.hours);
        date.setMinutes(time.minutes);
        holiday = new Holiday(date);
        console.log("Chiamo delete holiday ")
        this.reservationService.deleteHoliday(holiday);
        count++;
      }else{
        console.log("Chiamo delete holiday all day")
        count = this.reservationService.deleteHolidayAllDay(date);
      }
    }
    return count;
  }

  // Check if a date is between two dates
  isBetween(start: Time, end: Time, time: Time){
    let dateStart = new Date(2000,0,1,start.hours,start.minutes,0);
    let dateEnd = new Date(2000,0,1,end.hours,end.minutes,0);
    let dateTime = new Date(2000,0,1,time.hours,time.minutes,0);
    return (dateTime.getTime() >= dateStart.getTime() && dateTime.getTime() <= dateEnd.getTime());
  }


  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

}
