import { Component, OnInit } from '@angular/core';
import { srt } from '../srt'
import * as moment from 'moment';
import { ProgrammeService } from '../programme.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  serie: srt;

  constructor(private programmeService: ProgrammeService) { }

  ngOnInit() {
    this.programmeService.getProgramme().subscribe(programme => {
      console.log('got data from dashboard');
      this.serie = programme;
    });
  }

}
