import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ProgrammeService } from '../programme.service';
import { srt } from '../srt';
import { map } from 'lodash';
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
  serie: any;
  xValues: Date[];
  ec: any;
  symbolSize: number;

  constructor(private programmeService: ProgrammeService, private nes: NgxEchartsService) { }

  ngOnInit() {
    this.symbolSize = 20;
    this.programmeService.getProgramme().subscribe(srt => {
      this.serie = [];
      this.xValues = srt.indexes;
      this.serie = map(srt.points, (pt) => [pt.date, pt.valeur]);
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
          symbolSize: this.symbolSize,
          data: this.serie
        }]
    };
  }

  ngAfterViewInit() {
    let self = this;
    this.ec.setOption({
      graphic: this.generateGraphic()
    });
    /*this.ec.setOption({
      graphic: this.nes.echarts.util.map(this.serie, function (dataItem, dataIndex) {
        return {
          // 'circle' means this graphic element is a shape of circle.
          type: 'circle',

          shape: {
            // The radius of the circle.
            r: self.symbolSize / 2
          },
          position: self.ec.convertToPixel('grid', dataItem),
          invisible: true,
          draggable: true,
          z: 100,
          ondrag: self.nes.echarts.util.curry(onPointDragging, dataIndex, self)
        };
      })
    });*/
  }

  generateGraphic() {
    let res = [];
    let self = this;
    for (let i = 0; i < this.serie.length; ++i) {
      let curPos = this.ec.convertToPixel('grid', this.serie[i]);
      console.log('current position : ' + curPos);
      if (i != this.serie.length - 1) {
        let nextPos = this.ec.convertToPixel('grid', this.serie[i + 1]);
        console.log('next position : ' + nextPos);
        res.push({
          type: 'line',
          invisible: true,
          draggable: true,
          cursor: 'row-resize',
          z: 100,
          position: curPos,
          shape: {
            x2: nextPos[0],
          },
          style: {
            stroke: '#000'
          },
          ondrag: _.throttle(self.nes.echarts.util.curry(onPointDragging, i, self, curPos, 0), 1000 / 60)
        });
      }
      if (i != 0) {
        let prevPos = this.ec.convertToPixel('grid', this.serie[i - 1]);
        console.log('previous position : ' + prevPos);
        res.push({
          type: 'line',
          invisible: false,
          draggable: true,
          cursor: 'col-resize',
          z: 100,
          position: curPos,
          shape: {
            y2: prevPos[1],
          },
          style: {
            stroke: '#000'
          },
          ondrag: _.throttle(self.nes.echarts.util.curry(onPointDragging, i, self, curPos, 1), 1000 / 60)
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
    /*zr.on('click', function (params) {
      console.log(params);
      if (self.ec) {
        var pointInPixel = [params.offsetX, params.offsetY];
        var pointInGrid = self.ec.convertFromPixel('grid', pointInPixel);

        if (self.ec.containPixel('grid', pointInPixel)) {
          self.serie.splice(findLastIndex(self.serie, pt => pt[0] < pointInGrid[0]) + 1, 0, pointInGrid);

          self.ec.setOption(
            {
              series: [{
                data: self.serie
              }]
            });
        }
      } else {
        console.log('ec non définie.');
      }
    });*/
  }
}

function onPointDragging(dataIndex: number, comp: ChartComponent, position: any, axisIndex: number) {
  this.position[axisIndex] = position[axisIndex];
  comp.serie[dataIndex] = comp.ec.convertFromPixel('grid', this.position);
  comp.ec.setOption({
    series: [{
      data: comp.serie
    }]
  });
}

/*function onPointDragging(dataIndex: number, comp: ChartComponent) {
  comp.serie[dataIndex] = comp.ec.convertFromPixel('grid', this.position);
  comp.ec.setOption({
    series: [{
      data: comp.serie
    }]
  });
}*/
