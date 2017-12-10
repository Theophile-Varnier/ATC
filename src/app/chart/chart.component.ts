import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ProgrammeService } from '../programme.service';
import { srt } from '../srt';
import { map, Dictionary } from 'lodash';
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
  chartOption: any;
  serie: any;
  ec: any;
  graphics: Dictionary<{
    'index': number;
    'graphics': any[];
  }>;
  symbolSize: number;

  constructor(private programmeService: ProgrammeService, private nes: NgxEchartsService) { }

  onChartInit(event: any) {
    this.ec = event;
  }

  ngOnInit() {
    this.symbolSize = 20;
    let self = this;
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
          max: this.serie[this.serie.length - 1][0]
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
    this.graphics = _.keyBy(_.map(this.serie, function (item, index) {
      let res = [];
      let curPos = self.ec.convertToPixel('grid', item);
      if (index != 0) {
        let prevPos = self.ec.convertToPixel('grid', self.serie[index - 1]);
        res.push({
          id: 'v' + index,
          type: 'line',
          invisible: false,
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
          ondrag: _.throttle(self.nes.echarts.util.curry(onPointDragging, index, self, curPos, 1), 1000 / 60),
          ondragend: self.nes.echarts.util.curry(removeObsolete, index, self)
        });
      }
      if (index != self.serie.length - 1) {
        let nextPos = self.ec.convertToPixel('grid', self.serie[index + 1]);
        res.push({
          id: 'h' + index,
          type: 'line',
          invisible: false,
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
          ondrag: _.throttle(self.nes.echarts.util.curry(onPointDragging, index, self, curPos, 0), 1000 / 60)
        });
      }
      return {
        'index': index,
        'graphics': res
      };
    }), obj => obj.index);

    this.ec.setOption({
      graphic: _.flatMap(this.graphics, kvp => kvp.graphics)
    });
  }
  refreshChart() {
    let currentGraphics = this.ec.getOption().graphic[0].elements;
    let count = this.serie.length;
    this.ec.setOption({
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
