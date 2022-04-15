import { Subject } from 'rxjs/Subject';
import {Treatment} from "../shared/treatment.model";
import {Reservation} from "../shared/reservation.model";
import {CalendarView} from "angular-calendar";
import {Holiday} from "../shared/holiday.model";
import {Time} from "@angular/common";
import {isEqual} from "date-fns";
import {DataStorageService} from "../shared/data-storage.service";
import {Injectable, OnInit} from "@angular/core";
import {Subscription} from "rxjs";

type CalendarPeriod = 'day' | 'week' | 'month';

@Injectable({ providedIn: 'root' })
export class ReservationsListService implements OnInit{
  reservationsChanged = new Subject<Reservation[]>();
  holidaysChanged = new Subject<Holiday[]>();

  reservationsLoaded = new Subject<void>();
  holidaysLoaded = new Subject<void>();

  private reservations: Reservation[] = [
    // new Reservation('Mario', 'Rossi',
    //   'antonio.acunzo97@gmail.com', 3932636141,
    //   new Date(2022,2,10,8,0,0),
    //   'Shampoo'),
    //  new Reservation('Antonio', 'Acunzo',
    //    'antonio.acunzo97@gmail.com', 3932636141,
    //    new Date(2022,2,1,8,0,0),
    //    'Taglio')
  ];
  private holidays: Holiday[] = [
    // new Holiday(new Date(2022,1,26,10,0,0)),
    // new Holiday(new Date(2022,2,4,8,0,0)),
  ];
  private hoursList: Time[] = [];

  private maxReservationForDay : number = 26;
  private startHour: number = 8;
  private mondayWork : boolean = false;

  private clickedDate: Date;


  constructor() {  }

  ngOnInit() {
    console.log("Servizio Reservations list");
    console.log("Carico le prenotazioni e le chiusure");
    console.log(this.reservations);
    console.log(this.holidays);
  }


  setReservations(extracted: any[]){
    console.log("Chiamo set reservation")
    console.log("Prenotazioni caricate:")
    //console.log(this.reservations)
    let reservations = this.parseDataReservation(extracted);
    this.reservations = reservations;
    this.updateDatabase();
    this.reservationsChanged.next(this.reservations.slice());
    this.reservationsLoaded.next();
    console.log(this.reservations)
  }

  parseDataReservation(extracted : any[]){
    let data : Reservation[] = [];
    extracted.forEach( (reservation, index) => {
      data.push(
        new Reservation(
          reservation.name,
          reservation.surname,
          reservation.email,
          reservation.number,
          new Date(reservation.date),
          reservation.treatment)
      );
    });
    //console.log(data)
    return data;
  }

  setHolidays(extracted: any[]){
    console.log("Chiamo set holidays")
    console.log("Chiusure caricate:")
    let holidays = this.parseDataHoliday(extracted);
    this.holidays = holidays;
    this.updateDatabase();
    this.holidaysChanged.next(this.holidays.slice());
    this.holidaysLoaded.next();
    console.log(this.holidays)

  }

  parseDataHoliday(extracted : any[]){
    let data : Holiday[] = [];
    extracted.forEach( (holiday) => {
      data.push(new Holiday(new Date(holiday.date)));
    });
    return data;
  }

  getMaxReservationForDay(){
    return this.maxReservationForDay;
  }

  getMondayWork(){
    return this.mondayWork;
  }

  getReservations() {
    return this.reservations.slice();
  }

  getHolidays(){
    return this.holidays.slice();
  }

  getClickedDate(){
    return this.clickedDate;
  }

  // getDaysOfMonth(){
  //   return this.daysOfMonth;
  // }


  setClickedDate(date: Date){
    this.clickedDate = date;
    //this.daysOfMonth = this.getDaysInMonthUTC(date.getUTCMonth(), date.getUTCFullYear());
    // console.log(this.daysOfMonth)
    // console.log("Data " + this.clickedDate);
    // console.log("Giorno " + this.clickedDate.getUTCDay());
    // console.log("Mese " + (this.clickedDate.getUTCMonth()+1));
    // console.log("Anno " + this.clickedDate.getUTCFullYear());
    // console.log("Ora " + this.clickedDate.getUTCHours());
    // console.log(" " + this.clickedDate.toDateString());
    // console.log("Giorno select" + this.clickedDate.getUTCDay() + "/" + (this.clickedDate.getUTCMonth()+1));
    //console.log(" " + this.clickedDate.toLocaleDateString());
  }

  // getDaysInMonthUTC(month: number, year: number) {
  //   let date = new Date(Date.UTC(year, month, 1));
  //   let days = [];
  //   while (date.getUTCMonth() === month) {
  //     //days.push(new Date(date));
  //     days.push(date.toLocaleDateString());
  //     date.setUTCDate(date.getUTCDate() + 1);
  //   }
  //   //console.log(days)
  //   return days;
  // }

  getReservation(index: number) {
    return this.reservations[index];
  }

  addReservation(reservation: Reservation) {
    this.reservations.push(reservation);
    this.reservationsChanged.next(this.reservations.slice());
  }

  daysInMonth (month: number, year: number) {
    //console.log(new Date(year, month, 0).toLocaleDateString())
    return new Date(year, month, 0).getDate();

  }

  addHoliday(holiday: Holiday): void{
    this.holidays.push(holiday);
    //this.dataStorageService.storeHoliday(this.holidays);
    this.holidaysChanged.next(this.holidays.slice());
  }

  addHolidayMonth(date: Date): void {
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    //console.log("giorno : ", day, " mese: ",date.getMonth()+1);
    let days = this.daysInMonth(month+1,year);
    console.log(days)
    let holiday;
    for(let i = 0; i < days; i++){
      this.addHolidayDay(new Date(year,month,i));

      // holiday = new Holiday(new Date(year,month,i,10,0,0)),
      // this.holidays.push(holiday);
      // this.holidaysChanged.next(this.holidays.slice());
    }
    console.log(this.holidays)
  }

  createHoursList(){
    this.hoursList=[];
    for (let i = 8; i < 21; i++) {
      this.hoursList.push({hours: i, minutes: 0});
      this.hoursList.push({hours: i, minutes: 30});
    }
    this.hoursList.push({hours: 0, minutes: 0})
    //console.log(this.hoursList)
  }

  addHolidayDay(date: Date): number {
    let inserted=0;
    if (date.getDay() === 1 && !this.mondayWork) return;
    else{
      this.createHoursList();
      let holiday;
      for(let time of this.hoursList){
        if (time.hours !== 0) {
          if (date.toLocaleDateString() !== new Date().toLocaleDateString()){
            holiday = new Holiday(
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                time.hours,
                time.minutes,
                0));
            this.addHoliday(holiday);
            inserted++;
          }else{
            console.log(time.hours + ':' + time.minutes);
            if (time.hours > new Date().getHours()
              || (time.hours === new Date().getHours() && time.minutes >= new Date().getMinutes())){
              holiday = new Holiday(
                new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  time.hours,
                  time.minutes,
                  0));
              console.log(holiday)
              this.addHoliday(holiday);
              inserted++;
            }

          }


        }
      }
      console.log(this.holidays)
    }
    return inserted;
  }

  addHolidaySingleTime(date: Date, hoursStart: Time): void {
    if (date.getDay() === 1 && !this.mondayWork) return;
    else {
      let holiday = new Holiday(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hoursStart.hours,
          hoursStart.minutes,
          0));
      this.addHoliday(holiday);
    }
  }

  addHolidayTime(date: Date, hoursStart: Time, hoursEnd: Time): number {
    let holiday: Holiday;
    let inserted = 0;
    if(hoursStart.hours === hoursEnd.hours){
      this.addHolidaySingleTime(date, hoursStart);
      inserted = 1;
    }else{
      this.createHoursList();
      console.log(hoursStart);
      console.log({hours:hoursStart.hours, minutes: hoursStart.minutes})

      let indexStart;
      let indexEnd;

      for( let x of this.hoursList){
        if(JSON.stringify(x) === JSON.stringify(hoursStart))  indexStart = this.hoursList.indexOf(x);
        if(JSON.stringify(x) === JSON.stringify(hoursEnd))  indexEnd = this.hoursList.indexOf(x);
      }

      if (indexEnd === this.hoursList.length) indexEnd -=1;

      inserted = indexEnd-indexStart;

      console.log("indici ",indexStart , '- ', indexEnd)
      for(let i = indexStart; i<indexEnd; i++){
        this.addHolidaySingleTime(date, this.hoursList[i]);
      }
    }
    return inserted;
    console.log(this.holidays)
  }

  // createTime(time:): Time{
  //     return {hou};
  // }

  deleteReservation(reservation: Reservation) {
    this.reservations.forEach( (item, index) => {
      if(item === reservation){
        this.reservations.splice(index,1);
      }
    });
    this.reservationsChanged.next(this.reservations.slice());
  }

  deleteHoliday(holiday: Holiday) : number{
    let removed = 0;
    this.holidays.forEach( (item, index) => {
      if(item.getDate().getTime() === holiday.getDate().getTime()){
        //console.log("Trovata ")
        this.holidays.splice(index,1);
        removed++;
      }
    });
    this.holidaysChanged.next(this.holidays.slice());
    return removed;
  }

  deleteHolidayAllDay(date: Date): number{
    let removed = 0;
    for (let i = this.holidays.length-1; i>=0; i--) {
      if(this.holidays[i].getDate().toLocaleDateString() === date.toLocaleDateString()){
        this.holidays.splice(i,1);
        removed++;
      }
    }
    this.holidaysChanged.next(this.holidays.slice());
    console.log(this.holidays)
    return removed;
  }

  countReservation(date : Date) : number{
    let count: number = 0;
    for (let reservation of this.reservations) {
      // console.log(this.reservations[i].getDate().getMonth() +'-'+ date.getMonth());
      //console.log(reservation.getDate().getDate()  + '-' +  date.getDate());
      // if (reservation.getDate().getMonth() == date.getMonth() &&
      //   reservation.getDate().getDate() == date.getDate()){
      if (reservation.getDate().toLocaleDateString() === date.toLocaleDateString()) count += 1;
    }
    return count;
  }

  getReservationFromData(email: string, number: number, date: Date, time: Time): Reservation{
    this.createHoursList();
    for (let reservation of this.reservations) {
      if(reservation.getEmail() == email && reservation.getNumber() == number
      && reservation.getDate().toLocaleDateString() == date.toLocaleDateString()
      && time.hours == reservation.getTime().hours
      && time.minutes === reservation.getTime().minutes){
        return reservation;
      }
    }
    return null;
  }

  getReservationFromDateHours(date: Date, time: Time): Reservation{
    //console.log(time)
    console.log(date)
    this.createHoursList();
    for (let reservation of this.reservations) {
      // console.log(reservation.getDate().toLocaleDateString(), " - ", date.toLocaleDateString())
      // console.log(time.hours , " - ", reservation.getDate().getHours())
      // console.log(time.minutes , " - ", reservation.getDate().getMinutes())
      // console.log(reservation.getDate(), " - ", date)
      // if(reservation.getDate().toLocaleDateString() === date.toLocaleDateString()
      //   && hours.hours == reservation.getDate().getHours()
      //   && hours.minutes == reservation.getDate().getMinutes()){
      //   return reservation;
      // }
      if(reservation.getDate().toLocaleDateString() === date.toLocaleDateString()
          && time.hours == reservation.getDate().getHours()
          && time.minutes == reservation.getDate().getMinutes()) {
        return reservation;
      }
    }
    return null;
  }

  getHolidayFromDateHours(date: Date, hours: Time): Holiday{
    this.createHoursList();
    for (let holiday of this.holidays) {
      if(holiday.getDate().toLocaleDateString() == date.toLocaleDateString()
        && hours.hours == holiday.getDate().getHours()
        && hours.minutes == holiday.getDate().getMinutes()){
        return holiday;
      }
    }
    return null;
  }




  reservedFromTime(date: Date, hoursStart: Time, hoursEnd: Time): Reservation{
    // if(hoursStart.hours === hoursEnd.hours){
    //   console.log("Controllo appuntamento solo di uno slot")
    //   for (let reservation of this.reservations) {
    //     if(reservation.getDate().toLocaleDateString() == date.toLocaleDateString()
    //       && hoursStart == reservation.getHour1()){
    //       return reservation;
    //     }
    //   }
    // }else{
    //
    // }

    this.createHoursList();

    let indexStart;
    let indexEnd;


    for( let x of this.hoursList){
      if(x.hours === hoursStart.hours && x.minutes === hoursStart.minutes) indexStart = this.hoursList.indexOf(x);
      if(x.hours === hoursEnd.hours && x.minutes === hoursEnd.minutes)  indexEnd = this.hoursList.indexOf(x);
    }

    if (indexEnd === this.hoursList.length) indexEnd -=1;

    //console.log("indici ",indexStart , '- ', indexEnd)
    let reservation;
    for (let i=indexStart; i< indexEnd; i++) {
      reservation = this.getReservationFromDateHours(date, this.hoursList[i]);
      console.log('reservation: ',reservation)
      if( reservation !== null){
        console.log("trovata")
        return reservation;
      }
    }
    return null;

  }

  reservedFromDate(date: Date): Reservation{
    for (let reservation of this.reservations) {
      if(reservation.getDate().toLocaleDateString() == date.toLocaleDateString()){
        return reservation;
      }
    }
    return null;
  }

  unavailableFromDate(date: Date): Reservation | Holiday{
    for (let reservation of this.reservations) {
      if(reservation.getDate().toLocaleDateString() == date.toLocaleDateString()){
        return reservation;
      }
    }
    for (let holiday of this.holidays) {
      if(holiday.getDate().toLocaleDateString() == date.toLocaleDateString()){
        return holiday;
      }
    }
    return null;
  }

  unavailableFromTime(date: Date, hoursStart: Time, hoursEnd: Time): Reservation | Holiday{

    console.log(this.reservations)
    console.log(date)
    console.log(hoursStart)
    console.log(hoursEnd)

    this.createHoursList();

    let indexStart;
    let indexEnd;

    for( let x of this.hoursList){
      if(x.hours === hoursStart.hours && x.minutes === hoursStart.minutes) indexStart = this.hoursList.indexOf(x);
      if(x.hours === hoursEnd.hours && x.minutes === hoursEnd.minutes)  indexEnd = this.hoursList.indexOf(x);
    }
    //console.log(indexStart , '-', indexEnd)

    if (indexEnd === this.hoursList.length) indexEnd -=1;

    console.log("indici ",indexStart , '- ', indexEnd)
    let reservation, holiday;
    for (let i=indexStart; i< indexEnd; i++) {
      reservation = this.getReservationFromDateHours(date, this.hoursList[i]);
      console.log('reservation: ',reservation)
      if( reservation !== null) return reservation;
      holiday = this.getHolidayFromDateHours(date, this.hoursList[i]);
      if( holiday !== null) return holiday;
    }
    return null;

  }


  //Metodo che elimina le prenotazioni o chiusure date precedenti alla corrente
  updateDatabase(): void{
    for (let i=this.reservations.length-1; i>=0; i--) {
      //console.log(this.reservations[i])
      if (this.reservations[i].getDate().getTime() < new Date().getTime()+600000)
        this.reservations.splice(i,1);
    }
    for (let i = this.holidays.length-1; i>=0; i--) {
      if (this.holidays[i].getDate().getTime() < new Date().getTime()+600000)
        this.holidays.splice(i,1);
    }
    this.reservationsChanged.next(this.reservations.slice());
    this.holidaysChanged.next(this.holidays.slice());
  }

  countReservationOfDay(date : Date) : number{
    let count: number = 0;
    for (let reservation of this.reservations) {
      // console.log(this.reservations)
      // console.log(reservation)
      // console.log(reservation.getDate())
      if (reservation.getDate().toLocaleDateString() == date.toLocaleDateString())
        count += 1;
    }
    return count;
  }

  countHolidayOfDay(date : Date) : number{
    let count: number = 0;
    for (let holiday of this.holidays) {
      if (holiday.getDate().toLocaleDateString() == date.toLocaleDateString())
        count += 1;
    }
    return count;
  }

  countPrevHoursOfDay(date: Date): number{
    let count = 0;
    let currentDate = new Date();
    if(date.toLocaleDateString() === currentDate.toLocaleDateString()
      && currentDate.getHours() >= 8){
      count = (currentDate.getHours() - this.startHour) * 2;
      //console.log(count)
      if (currentDate.getMinutes() <= 20 ) count++;
      if (currentDate.getMinutes() > 20 && currentDate.getMinutes() <=50) count+=2;
      if (currentDate.getMinutes() > 50 ) count+=3;
    }





    return count;

  }

}
