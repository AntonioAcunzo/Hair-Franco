import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ReservationComponent} from "./reservation/reservation.component";
import {TreatmentsListComponent} from "./treatments/treatments-list.component";
import {ContactsComponent} from "./contacts/contacts.component";
import {AuthComponent} from "./auth/auth.component";
import {ChangeCalendarComponent} from "./change-calendar/change-calendar.component";
import {CancelReservationComponent} from "./cancel-reservation/cancel-reservation.component";

const routes: Routes = [
  { path: '', redirectTo: '/prenota-appuntamento', pathMatch: 'full' },
  { path: 'prenota-appuntamento', component: ReservationComponent },
  { path: 'trattamenti', component: TreatmentsListComponent },
  { path: 'contatti', component: ContactsComponent },
  { path: 'login', component: AuthComponent },
  { path: 'modifica-calendario', component: ChangeCalendarComponent },
  { path: 'cancella-appuntamento', component: CancelReservationComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
