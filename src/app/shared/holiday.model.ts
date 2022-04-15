import {Time} from "@angular/common";

export class Holiday {

  titleHoliday : string = 'Negozio Chiuso';

  constructor(private date: Date) {}

  getDate(): Date{
    return this.date;
  }

  getTime(): Time{
    return {hours: this.date.getHours(), minutes: this.date.getMinutes()}
  }

  getInfo(): string{
    return this.titleHoliday;
  }

}
