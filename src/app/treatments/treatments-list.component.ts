import { Component, OnInit } from '@angular/core';
import {Treatment} from "../shared/treatment.model";
import {TreatmentsListService} from "./treatments-list.service";

@Component({
  selector: 'app-treatments',
  templateUrl: './treatments-list.component.html',
  styleUrls: ['./treatments-list.component.css']
})
export class TreatmentsListComponent implements OnInit {

  treatments: Treatment[];

  constructor(private tlService: TreatmentsListService) { }

  ngOnInit() {
    this.treatments = this.tlService.getTreatmet();
  }

}
