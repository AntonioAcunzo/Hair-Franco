import {Injectable, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Reservation } from './reservation.model';
import { Holiday } from './holiday.model';
import {ReservationsListService} from "../reservation/reservations-list.service";

@Injectable({ providedIn: 'root' })
export class DataStorageService implements OnInit{

  constructor(private http: HttpClient,
              private reservationService: ReservationsListService) { }

  ngOnInit() {}

  // Store reservation on online database
  storeReservation(reservations: Reservation[]) {
    this.http
      .put(
        'https://hair-franco-default-rtdb.europe-west1.firebasedatabase.app/reservations.json',
        reservations
      )
      .subscribe(response => {
        //console.log(response);
      });
  }

  // Store holiday on online database
  storeHoliday(holidays: Holiday[]){
    console.log("Store holiday")
    //const holidays = this.reservationService.getHolidays();
    this.http
      .put(
        'https://hair-franco-default-rtdb.europe-west1.firebasedatabase.app/holidays.json',
        holidays
      )
      .subscribe(response => {
        //console.log(response);
      });

  }

  // Fetch holidays on online database
  fetchHolidays() {
    return this.http
      .get<any[]>(
        'https://hair-franco-default-rtdb.europe-west1.firebasedatabase.app/holidays.json'
      )
      .subscribe(response => {
        //console.log(response);
        if(response !== null)
          this.reservationService.setHolidays(response);
      });
  }

  // Fetch reservations on online database
  fetchReservations() {
    return this.http
      .get<any[]>(
        'https://hair-franco-default-rtdb.europe-west1.firebasedatabase.app/reservations.json'
      )
      .subscribe(response => {
        console.log(response);
        if(response !== null)
          this.reservationService.setReservations(response);
      });
  }




}
