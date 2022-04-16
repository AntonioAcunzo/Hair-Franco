import { Subject } from 'rxjs/Subject';
import {Reservation} from "../shared/reservation.model";
import {Holiday} from "../shared/holiday.model";
import {Time} from "@angular/common";
import {Injectable, OnInit} from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ReservationsListService implements OnInit{

  reservationsChanged = new Subject<Reservation[]>();
  holidaysChanged = new Subject<Holiday[]>();

  reservationsLoaded = new Subject<void>();
  holidaysLoaded = new Subject<void>();

  private reservations: Reservation[] = [];
  private holidays: Holiday[] = [];
  private hoursList: Time[] = [];

  private maxReservationForDay : number = 26;
  private startHour: number = 8;
  private mondayWork : boolean = false;

  private clickedDate: Date;

  constructor() {}

  ngOnInit() {}

  // Save the reservations extracted from database in local
  setReservations(extracted: any[]){
    this.reservations = this.parseDataReservation(extracted);
    this.updateDatabase();
    this.reservationsChanged.next(this.reservations.slice());
    this.reservationsLoaded.next();
  }

  // Extract reservations from data extracted from database
  parseDataReservation(extracted : any[]){
    let data : Reservation[] = [];
    extracted.forEach( (reservation) => {
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
    return data;
  }

  // Save the holidays extracted from database in local
  setHolidays(extracted: any[]){
    this.holidays = this.parseDataHoliday(extracted);
    this.updateDatabase();
    this.holidaysChanged.next(this.holidays.slice());
    this.holidaysLoaded.next();
  }

  // Extract reservations from data extracted from database
  parseDataHoliday(extracted : any[]){
    let data : Holiday[] = [];
    extracted.forEach( (holiday) => {
      data.push(new Holiday(new Date(holiday.date)));
    });
    return data;
  }

// Getter

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


  setClickedDate(date: Date){
    this.clickedDate = date;
  }

  addReservation(reservation: Reservation) {
    this.reservations.push(reservation);
    this.reservationsChanged.next(this.reservations.slice());
  }

  daysInMonth (month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }

  addHoliday(holiday: Holiday): void{
    this.holidays.push(holiday);
    this.holidaysChanged.next(this.holidays.slice());
  }


  createHoursList(){
    this.hoursList=[];
    for (let i = 8; i < 21; i++) {
      this.hoursList.push({hours: i, minutes: 0});
      this.hoursList.push({hours: i, minutes: 30});
    }
    this.hoursList.push({hours: 0, minutes: 0})
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
              this.addHoliday(holiday);
              inserted++;
            }
          }
        }
      }
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
    let inserted = 0;
    if(hoursStart.hours === hoursEnd.hours){
      this.addHolidaySingleTime(date, hoursStart);
      inserted = 1;
    }else{
      this.createHoursList();
      let indexStart;
      let indexEnd;
      for( let x of this.hoursList){
        if(JSON.stringify(x) === JSON.stringify(hoursStart))  indexStart = this.hoursList.indexOf(x);
        if(JSON.stringify(x) === JSON.stringify(hoursEnd))  indexEnd = this.hoursList.indexOf(x);
      }
      if (indexEnd === this.hoursList.length) indexEnd -=1;
      inserted = indexEnd-indexStart;
      for(let i = indexStart; i<indexEnd; i++){
        this.addHolidaySingleTime(date, this.hoursList[i]);
      }
    }
    return inserted;
  }


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
    this.createHoursList();
    for (let reservation of this.reservations) {
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


  // Check if there is a reservation or holiday in input date
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

  // Check if there is a reservation or holiday in input time and date
  unavailableFromTime(date: Date, hoursStart: Time, hoursEnd: Time): Reservation | Holiday{

    this.createHoursList();

    let indexStart;
    let indexEnd;

    for( let x of this.hoursList){
      if(x.hours === hoursStart.hours && x.minutes === hoursStart.minutes) indexStart = this.hoursList.indexOf(x);
      if(x.hours === hoursEnd.hours && x.minutes === hoursEnd.minutes)  indexEnd = this.hoursList.indexOf(x);
    }
    if (indexEnd === this.hoursList.length) indexEnd -=1;

    let reservation, holiday;
    for (let i=indexStart; i< indexEnd; i++) {
      reservation = this.getReservationFromDateHours(date, this.hoursList[i]);

      if( reservation !== null) return reservation;
      holiday = this.getHolidayFromDateHours(date, this.hoursList[i]);
      if( holiday !== null) return holiday;
    }
    return null;
  }

  // Delete reservations or holidays in past date
  updateDatabase(): void{
    for (let i=this.reservations.length-1; i>=0; i--) {
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

  // Count reservations in input date
  countReservationOfDay(date : Date) : number{
    let count: number = 0;
    for (let reservation of this.reservations) {
      if (reservation.getDate().toLocaleDateString() == date.toLocaleDateString())
        count += 1;
    }
    return count;
  }

  // Count Holiday in input date
  countHolidayOfDay(date : Date) : number{
    let count: number = 0;
    for (let holiday of this.holidays) {
      if (holiday.getDate().toLocaleDateString() == date.toLocaleDateString())
        count += 1;
    }
    return count;
  }

  // Count past slots of hours
  countPrevHoursOfDay(date: Date): number{
    let count = 0;
    let currentDate = new Date();
    if(date.toLocaleDateString() === currentDate.toLocaleDateString()
      && currentDate.getHours() >= 8){
      count = (currentDate.getHours() - this.startHour) * 2;
      if (currentDate.getMinutes() <= 20 ) count++;
      if (currentDate.getMinutes() > 20 && currentDate.getMinutes() <=50) count+=2;
      if (currentDate.getMinutes() > 50 ) count+=3;
    }
    return count;
  }

}
