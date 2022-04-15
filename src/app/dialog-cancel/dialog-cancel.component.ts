import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Treatment} from "../shared/treatment.model";
import {ReservationsListService} from "../reservation/reservations-list.service";
import {Reservation} from "../shared/reservation.model";
import {DataStorageService} from "../shared/data-storage.service";

@Component({
  selector: 'app-dialog-cancel',
  templateUrl: './dialog-cancel.component.html',
  styleUrls: ['./dialog-cancel.component.css']
})
export class DialogCancelComponent implements OnInit {

  form: FormGroup;

  email : FormControl ;
  number : FormControl ;
  date : FormControl ;
  hours : FormControl ;

  name : string ;
  surname : string
  treatment : string ;

  founded : boolean = false;
  tried : boolean = false;
  reservation : Reservation;
  hoursList: string[];
  minDate: Date;

  constructor(private dialogRefCancel: MatDialogRef<DialogCancelComponent>,
              private reservationService: ReservationsListService,
              private dataStorageService: DataStorageService,) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'email' : new FormControl(null, [Validators.required, Validators.email]),
      'number' : new FormControl(null,[Validators.required, Validators.pattern("^((\\+39-?)|0)?[0-9]{10}$")]),
      'date' : new FormControl('', [Validators.required]),
      'hours' : new FormControl('', [Validators.required]),
    });
    this.hoursList = [];
    for (let i = 8; i < 21; i++) {
      this.hoursList.push(i.toString() + ':00');
      this.hoursList.push(i.toString() + ':30');
    }

    this.minDate = new Date();
  }

  findReservation(){
    if (this.form.valid){
      this.reservation = this.reservationService.getReservationFromData(
        this.form.value.email,this.form.value.number,this.form.value.date,this.form.value.hours);
      if (this.reservation != null) {
        this.founded = true;
        this.tried = false;
      }else{
        //this.founded = false;
        this.tried = true;
      }
    }else{
      console.log("Il form non è valido");
      // console.log(this.form.get('email').status);
      // console.log(this.form.get('number').value);
      // console.log(this.form.get('number').hasError('required'));
      // this.getErrorMessage('email');
      // this.getErrorMessage('number');
    }
    //this.getErrorMessage('email');

  }

  deleteReservation(){
    this.reservationService.deleteReservation(this.reservation);
    this.onCloseDialog();
  }

  onCloseDialog() {
    this.dialogRefCancel.close();
  }

  getErrorMessage(s : String) {
    if (s == 'email'){
      return (this.form.get('email').hasError('required')) ? 'Inserire una mail.' : 'Email non valida.';
    }
    if (s == 'number'){
      console.log()
      return (this.form.get('number').hasError('required')) ? 'Inserire numero di cellulare.' : 'Inserire numero di cellulare valido.';
    }
    // if (s == 'date'){
    //   return (this.form.get('date').hasError('required')) ? 'Selezionare una data' : '';
    // }
    // if (s == 'hours'){
    //   return (this.form.get('hours').hasError('required')) ? 'Selezionare un orario' : '';
    // }
  }

}
