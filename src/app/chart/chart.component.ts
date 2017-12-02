import { Component, OnInit } from '@angular/core';
import { ProgrammeService } from '../programme.service';
import { srt } from '../srt';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  chartOption: any;
  serie: any;
  xValues: Date[];

  constructor(private programmeService: ProgrammeService) { }

  ngOnInit() {
    this.programmeService.getProgramme().subscribe(srt => {
      this.serie = [];
      this.xValues = srt.indexes;
      for(let point of srt.points){
        this.serie.push([point.date, point.valeur]);
      }
    });
    this.chartOption = {
      title: {
        text: 'Visualisation des programmes'
      },
      xAxis: {
        type: 'time'
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Programme',
          type: 'line',
          step: 'end',
          data: this.serie
        }]
    };
  }

}
