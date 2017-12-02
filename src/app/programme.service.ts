import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { srt } from './srt';
import * as moment from 'moment';
import { point } from './point';

@Injectable()
export class ProgrammeService {

  constructor() { }

  private generateProgramme(): srt{
    console.log("génération du programme.");
    let date = moment();
    date.hours(0);
    date.minute(0);
    date.seconds(0);
    let res = new srt();
    let dateCourante = moment(date.toDate());
    while(dateCourante.diff(date, 'days') < 2){
      let pt = new point();
      pt.date = dateCourante.toDate();
      pt.valeur = Math.random() * 40;
      res.points.push(pt);
      res.indexes.push(dateCourante.toDate());
      dateCourante.add(30, 'minutes');
    }
    return res;
  }

  getProgramme(): Observable<srt>{
    return of(this.generateProgramme());
  }
}