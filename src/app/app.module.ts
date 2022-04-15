import {Inject, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContactsComponent } from './contacts/contacts.component';
import { HeaderComponent } from './header/header.component';
import { TreatmentsListComponent } from './treatments/treatments-list.component';
import { ReservationComponent } from './reservation/reservation.component';
import { TreatmentsListService } from "./treatments/treatments-list.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { CalendarHeaderComponent } from './demo-utils/calendar-header/calendar-header.component';

import {CommonModule, registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {ReservationsListService} from "./reservation/reservations-list.service";
import { ReservationStartComponent } from './reservation/reservation-start/reservation-start.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatListModule} from "@angular/material/list";
import {DialogContent, DialogFormComponent} from './dialog-form/dialog-form.component';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {OverlayModule} from "@angular/cdk/overlay";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatInputModule} from "@angular/material/input";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatDatepickerModule, MatDateRangePicker} from "@angular/material/datepicker";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatMenuModule} from "@angular/material/menu";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatCardModule} from "@angular/material/card";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatStepperModule} from "@angular/material/stepper";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatRadioModule} from "@angular/material/radio";
import {MatChipsModule} from "@angular/material/chips";
import {MAT_DATE_LOCALE, MatNativeDateModule, MatRippleModule} from "@angular/material/core";
import {MatSliderModule} from "@angular/material/slider";
import { DialogComponent } from './dialog/dialog.component';
import { DialogSummaryComponent } from './dialog-summary/dialog-summary.component';
import { DialogCancelComponent } from './dialog-cancel/dialog-cancel.component';
import { AuthComponent } from './auth/auth.component';
import {LoadingSpinnerComponent} from "./shared/loading-spinner/loading-spinner.component";
import {HttpClientModule} from "@angular/common/http";
import { ChangeCalendarComponent } from './change-calendar/change-calendar.component';
import { CancelReservationComponent } from './cancel-reservation/cancel-reservation.component';
import { DialogCalendarComponent } from './dialog-calendar/dialog-calendar.component';



registerLocaleData(localeIt);


@NgModule({
  declarations: [
    AppComponent,
    ContactsComponent,
    HeaderComponent,
    TreatmentsListComponent,
    ReservationComponent,
    CalendarHeaderComponent,
    ReservationStartComponent,
    DialogFormComponent,
    DialogContent,
    DialogComponent,
    DialogSummaryComponent,
    DialogCancelComponent,
    AuthComponent,
    LoadingSpinnerComponent,
    ChangeCalendarComponent,
    CancelReservationComponent,
    DialogCalendarComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    //NgbModalModule,
    MatIconModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MatListModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,

    OverlayModule

  ],
  providers: [TreatmentsListService,
    ReservationsListService,
    {provide: MAT_DATE_LOCALE, useValue: 'it-IT'},],
    // {provide: DateAdapter, useClass: MyDateAdapter }
  // , {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  exports: [DialogContent],
  entryComponents: [DialogContent],
  bootstrap: [AppComponent]
})
export class AppModule {

}
