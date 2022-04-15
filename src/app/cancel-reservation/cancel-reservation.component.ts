import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Reservation} from "../shared/reservation.model";
import {ReservationsListService} from "../reservation/reservations-list.service";
import {Time} from "@angular/common";
import {DataStorageService} from "../shared/data-storage.service";

@Component({
  selector: 'app-cancel-reservation',
  templateUrl: './cancel-reservation.component.html',
  styleUrls: ['./cancel-reservation.component.css']
})
export class CancelReservationComponent implements OnInit {

  form: FormGroup;

  email : FormControl ;
  number : FormControl ;
  date : FormControl ;
  hours : FormControl ;

  name : string ;
  surname : string
  treatment : string ;

  founded : boolean;
  tried : boolean;
  reservation : Reservation;
  hoursList: Time[];
  minDate: Date;

  errorMessage: string;
  confirmMessage: string;

  constructor(private reservationService: ReservationsListService,
              private dataStorageService: DataStorageService) { }

  // Initialization
  ngOnInit(): void {
    this.form = new FormGroup({
      'email' : new FormControl(null, [Validators.required, Validators.email]),
      'number' : new FormControl(null,[Validators.required, Validators.pattern("[0-9]{10}")]),
      'date' : new FormControl('', [Validators.required]),
      'hours' : new FormControl('', [Validators.required]),
    });
    this.hoursList = [];
    for (let i = 8; i < 21; i++) {
      this.hoursList.push({hours: i, minutes:0});
      this.hoursList.push({hours: i, minutes:30});
    }
    this.minDate = new Date();
    this.errorMessage = null;
    this.confirmMessage = null;
    this.founded = false;
    this.tried = false;
  }

  // Search reservation in the database
  findReservation(): void{
    this.form.markAllAsTouched();
    if (this.form.valid){
      this.reservation = this.reservationService.getReservationFromData(
        this.form.value.email,this.form.value.number,this.form.value.date,this.form.value.hours);
      // Search results
      if (this.reservation != null) {
        this.founded = true;
        this.errorMessage = null;
        this.tried = false;
        //this.form.disable();
      }else{
        this.errorMessage = "Nessuna prenotazione trovata. Controllare i campi inseriti.";
        this.confirmMessage = null;
        this.tried = true;
      }
    }
  }

  // Delete reservation from database
  deleteReservation(): void{
    this.confirmMessage = 'Prenotazione cancellata!';
    this.reservationService.deleteReservation(this.reservation);
    this.dataStorageService.storeReservation(this.reservationService.getReservations());
    this.form.enable();
  }

  // Hide the reservation details if the form is modified
  clearResult(): void{
    this.reservation = null;
    this.founded = false;
  }

  // Function to handle errors in form fields
  getErrorMessage(s : String): string {
    if (s == 'email'){
      return (this.form.get('email').hasError('required')) ? 'Inserire una mail.' : 'Email non valida.';
    }
    if (s == 'number'){
      if (this.form.get('number').hasError('required')) return 'Inserire numero di cellulare.';
      if (this.form.get('number').hasError('pattern'))  return 'Inserire numero di cellulare valido.';
    }
    if (s == 'date'){
      return (this.form.get('date').hasError('required')) ? 'Selezionare una data' : 'Data non valida';
    }
    if (s == 'hours'){
      return (this.form.get('hours').hasError('required')) ? 'Selezionare un orario' : 'Orario non valido';
    }
    return;
  }

}
