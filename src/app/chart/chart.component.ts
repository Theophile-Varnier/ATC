import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ProgrammeService } from '../programme.service';
import { srt } from '../srt';
import { map } from 'lodash';
import * as moment from 'moment';
import { findLastIndex } from 'lodash';
import { NgxEchartsService } from 'ngx-echarts';
import * as _ from 'lodash';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements AfterViewInit, OnInit {
  initOps = {
    renderer: 'svg'
  };
  chartOption: any;
  updateOptions: any;
  serie: any;
  ec: any;
  symbolSize: number;

  constructor(private programmeService: ProgrammeService, private nes: NgxEchartsService) { }

  ngOnInit() {
    this.symbolSize = 20;
    this.programmeService.getProgramme().subscribe(srt => {
      console.log('got data in chart');
      this.serie = [];
      this.serie = map(srt.points, (pt) => [pt.date, pt.valeur]);
      this.chartOption = {
        title: {
          text: 'Visualisation des programmes'
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: function (value) {
              return moment(value).format('HH:mm');
            }
          },
          min: this.serie[0][0],
          max: this.serie[this.serie.length-1][0]
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Programme',
            type: 'line',
            step: 'end',
            symbolSize: this.symbolSize,
            data: this.serie
          }]
      };

    });
  }

  ngAfterViewInit() {
    let self = this;
    this.ec.setOption({
      graphic: this.generateGraphic()
    });
  }

  generateGraphic() {
    let res = [];
    let self = this;
    for (let i = 0; i < this.serie.length; ++i) {
      let curPos = this.ec.convertToPixel('grid', this.serie[i]);
      if (i != this.serie.length - 1) {
        let nextPos = this.ec.convertToPixel('grid', this.serie[i + 1]);
        res.push({
          id: 'h' + i,
          type: 'line',
          invisible: true,
          draggable: true,
          cursor: 'row-resize',
          z: 100,
          position: curPos,
          shape: {
            x2: nextPos[0] - curPos[0],
          },
          style: {
            stroke: '#fff'
          },
          ondrag: _.throttle(self.nes.echarts.util.curry(onPointDragging, i, self, curPos, 0), 1000 / 60)
        });
      }
      if (i != 0) {
        let prevPos = this.ec.convertToPixel('grid', this.serie[i - 1]);
        res.push({
          id: 'v'+i,
          type: 'line',
          invisible: true,
          draggable: true,
          cursor: 'col-resize',
          z: 100,
          position: curPos,
          shape: {
            y2: prevPos[1] - curPos[1],
          },
          style: {
            stroke: '#000'
          },
          ondrag: _.throttle(self.nes.echarts.util.curry(onPointDragging, i, self, curPos, 1), 1000 / 60),
          ondragend: self.nes.echarts.util.curry(removeObsolete, i, self)
        });
      }
    }
    return res;
  }

  onChartEvent(event: any) {
    console.log(event);
  }

  onChartInit(event: any) {
    this.ec = event;
    let zr = this.ec.getZr();
    let self = this;
  }

  refreshChart() {
    let currentGraphics = this.ec.getOption().graphic[0].elements;
    let count = this.serie.length;
    this.ec.setOption({
      graphic: _.concat(this.generateGraphic(), _.filter(currentGraphics, function(elem){
        return parseInt(elem.id[1]) > count;
      }).map(function(elem){
        return {
          id: elem.id,
          $action: 'remove'
        };
      })),
      series: [{
        data: this.serie
      }]
    });
  }
}

function onPointDragging(dataIndex: number, comp: ChartComponent, position: any, axisIndex: number) {
  this.position[axisIndex] = position[axisIndex];
  let newPos = comp.ec.convertFromPixel('grid', this.position);
  comp.serie[dataIndex] = newPos;
  comp.ec.setOption({
    series: [{
      data: comp.serie
    }]
  });
}

function removeObsolete(dataIndex: number, comp: ChartComponent) {
  let newX = comp.serie[dataIndex][0];
  _.remove(comp.serie, function (item, index) {
    return (index < dataIndex && item[0] >= newX) || (index > dataIndex && item[0] <= newX);
  });
  comp.refreshChart();
}
