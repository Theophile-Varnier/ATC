import { Component, OnInit } from '@angular/core';
import { srt } from '../srt'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  series: srt[];

  constructor() { }

  ngOnInit() {
  }

}
