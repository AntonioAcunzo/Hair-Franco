import {Time} from "@angular/common";

export class Reservation {

  constructor( public name: string,
               private surname: string,
               private email: string,
               private number: number,
               private date: Date,
               private treatment: string) {}

  getName(): string{
    return this.name;
  }

  getSurname(): string{
    return this.surname;
  }

  getEmail(): string{
    return this.email;
  }

  getNumber(): number{
    return this.number;
  }

  getDate(): Date{
    return this.date;
  }

  setDate(dateString: string){
    this.date = new Date(dateString)
  }

  getTime(): Time{
    return {hours: this.date.getHours(), minutes: this.date.getMinutes()}
  }


  getTreatment(): string{
    return this.treatment;
  }

  getInfo(): string{
    return this.name + " " + this.surname + " - " + this.treatment + " - " +
      this.number + ' - ' + this.email;
  }

}
