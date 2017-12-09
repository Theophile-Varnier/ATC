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
    let changeProba = 0.9;
    while(dateCourante.diff(date, 'days') < 2){
      if(Math.random() > changeProba){
        let pt = new point();
        pt.date = dateCourante.unix();
        pt.valeur = Math.random() * 40;
        res.points.push(pt);
        res.indexes.push(dateCourante.unix());
      }
      dateCourante.add(30, 'minutes');
    }
    return res;
  }

  getProgramme(): Observable<srt>{
    return of(this.generateProgramme());
  }
}