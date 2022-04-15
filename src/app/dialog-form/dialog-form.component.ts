import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {TreatmentsListService} from "../treatments/treatments-list.service";
import {Treatment} from "../shared/treatment.model";



@Component({
  selector: 'app-dialog-form',
  templateUrl: './dialog-form.component.html',
  styleUrls: ['./dialog-form.component.css']
})
export class DialogFormComponent{

  constructor(public dialog: MatDialog) { }

  openDialog() {

    // const dialogConfig = new MatDialogConfig();
    //
    // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;
    // //dialogConfig.hasBackdrop = false;
    // dialogConfig.backdropClass = "backdropBackground";
    // // this.overlay.getContainerElement().classList.add("bac");
    //
    // dialogConfig.panelClass= 'backdropBackground';
    //
    // dialogConfig.data = {
    //   id: 1,
    //   title: 'Angular For Beginners'
    // };
    //
    //
    // const dialogRef = this.dialog.open(DialogContent, dialogConfig);
    //
    // // const dialogRef = this.dialog.open(DialogContent, {
    // //   width: '250px',
    // //   hasBackdrop: true,
    // //   backdropClass: 'backdropBackground'
    // // });
    //
    // dialogRef.afterClosed().subscribe(
    //   data => console.log("Dialog output:", data)
    // );

    // const dialogRef = this.dialog.open(DialogContent);
    //
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // });
  }

}



@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content-example-dialog.html',
  styleUrls: ['./dialog-form.component.css']
})
export class DialogContent implements OnInit{

  form: FormGroup;
  floatLabelControl = new FormControl('auto');
  stores;
  treatments: Treatment[]

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<DialogContent>,
    private treatmentsService: TreatmentsListService
  ) {}

  ngOnInit() {

    this.treatments = this.treatmentsService.getTreatmet();
    this.stores==['arun','reddy','prova'];
    this.form = this.formBuilder.group({
      devicename: '',
      devicedesc: '',
      store: 'arun'
    });
    this.form.patchValue({
      store: this.stores ? this.stores[0] : 'None'
    });
  }


  onCloseDialog() {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close(this.form.value);
  }

  email = new FormControl('', [Validators.required, Validators.email]);

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'Inserire una mail valida!';
    }

    return this.email.hasError('email') ? 'Email non valida.' : '';
  }




  // save() {
  //   this.dialogRef.close(this.form.value);
  // }
  //
  // close() {
  //   this.dialogRef.close();
  // }
  //
  onNoClick(): void {
  //   this.dialogRef.close();
  }
}
