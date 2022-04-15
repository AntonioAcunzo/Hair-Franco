import {Injectable, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { Reservation } from '../shared/reservation.model';
import { Holiday } from '../shared/holiday.model';
import {ReservationsListService} from "../reservation/reservations-list.service";

@Injectable({ providedIn: 'root' })
export class DataStorageService implements OnInit{
  constructor(private http: HttpClient, private reservationService: ReservationsListService) {
    console.log("Servizio Data Storage");
  }

  ngOnInit() {
    //console.log("ciao sono il servizio Data Storage");
  }


  storeReservation(reservations: Reservation[]) {
    //const reservations = this.reservationService.getReservations();
    this.http
      .put(
        'https://hair-franco-default-rtdb.europe-west1.firebasedatabase.app/reservations.json',
        reservations
      )
      .subscribe(response => {
        //console.log(response);
      });
  }

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

  // fetchReservation() {
  //   return this.http
  //     .get<Reservation[]>(
  //       'https://hair-franco-default-rtdb.europe-west1.firebasedatabase.app/reservations.json'
  //     )
  //     .pipe(
  //       map(reservations => {
  //         return reservations.map(recipe => {
  //           // return {
  //           //   ...recipe,
  //           //   ingredients: recipe.ingredients ? recipe.ingredients : []
  //           // };
  //         });
  //       }),
  //       tap(recipes => {
  //         this.recipeService.setRecipes(recipes);
  //       })
  //     )
  // }

  // fetchReservations() {
  //   return this.http
  //     .get<Reservation[]>(
  //       'https://hair-franco-default-rtdb.europe-west1.firebasedatabase.app/reservations.json'
  //     )
  //     .pipe(
  //       map(reservations => {
  //         return reservations.map(reservation => {
  //           return {
  //             reservation
  //           };
  //         })
  //       }),
  //         tap(reservations => {
  //           console.log(reservations)
  //           this.reservationService.setReservations(reservations);
  //         })
  //       )
  //     // .subscribe(response => {
  //     //   console.log(response);
  //     //   this.reservationService.setReservations(response);
  //     //   //return response;
  //     // });
  // }

  fetchHolidays() {
    return this.http
      .get<any[]>(
        'https://hair-franco-default-rtdb.europe-west1.firebasedatabase.app/holidays.json'
      )
      .subscribe(response => {
        //console.log(response);
        this.reservationService.setHolidays(response);
      });
  }

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
