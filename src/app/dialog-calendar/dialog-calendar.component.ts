import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {GoogleApiService} from "../google/google-api.service";

@Component({
  selector: 'app-dialog-calendar',
  templateUrl: './dialog-calendar.component.html',
  styleUrls: ['./dialog-calendar.component.css']
})
export class DialogCalendarComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DialogCalendarComponent>,
              private google: GoogleApiService,) { }

  ngOnInit(): void {
  }

  onSubmit(){
    this.google.init({})
      .then(() => {
        console.log("Finito inserimento evento!");
        this.onCloseDialog();
      })
      .catch(() => {
        console.log("inserimento evento fallito!");
        this.onCloseDialog();
      });
  }

  onCloseDialog(){
    this.dialogRef.close();
  }


}



