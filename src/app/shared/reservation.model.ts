import {Time} from "@angular/common";

export class Reservation {

  //private name: string;
  // private surname: string;
  // private number: string;
  // private email: string;
  // private treatment: string;
  // private hours: string;
  // private day: string;
  // private month: string;
  // private year: string;

  // constructor( private name: string,
  //              private surname: string,
  //              private number: string,
  //              private email: string,
  //              private treatment: string,
  //              private hours: string,
  //              private day: string,
  //              private month: string,
  //              private year: string) {}

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
    //console.log(this.date)
    //console.log(typeof(this.date));
    return this.date;
  }

  setDate(dateString: string){
    this.date = new Date(dateString)
  }

  // getHour(){
  //   let time : string = this.getDate().getHours().toString() ;
  //   (this.getDate().getMinutes()==0) ? time += ':00' : time += ':30';
  //   return time;
  // }

  getTime(): Time{
    return {hours: this.date.getHours(), minutes: this.date.getMinutes()}
  }

  getHour1(){
    return {hours: this.getDate().getHours(), minutes: this.getDate().getMinutes()}
  }

  getTreatment(): string{
    return this.treatment;
  }

  getInfo(): string{
    return this.name + " " + this.surname + " - " + this.treatment + " - " +
      this.number + ' - ' + this.email;
  }

}
