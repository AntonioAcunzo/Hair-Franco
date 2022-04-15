import {Component, OnInit} from '@angular/core';
import {DataStorageService} from "./shared/data-storage.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'WebApp2';

  constructor() {} //private dataStorageService: DataStorageService


}
