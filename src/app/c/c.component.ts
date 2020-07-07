import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';
import * as moment from 'moment';

@Component({
  selector: 'app-c',
  templateUrl: './c.component.html',
  styleUrls: ['./c.component.css']
})
export class CComponent implements OnInit {

  constructor(private http: HttpClient, private appService: AppService) { }
  public machine: string;
  public date: string;
  public grossProduction: number = 0;
  private scrapProduction: number = 0;
  private runtime: number = 0;
  private downtime: number = 0;
  private productionContent: any[];
  private runtimeContent: any[];
  private previousMachine: string = "none";
  private previousDate: string = "none";
  public performance: string;
  public availability: string;
  public quality: string;
  public oee: string;
  public loadingFlag: boolean = true;
  private hours: string;
  private minutes: string;
  private seconds: string;
  arraysInit(): void { //getting data from server
    this.http.get<any>('https://building-blocks-backend.herokuapp.com/Production').subscribe(data => { //from Ogel.Production.csv converted to OgelProduction.json
      this.productionContent = data.slice();
    })
    this.http.get<any>('https://building-blocks-backend.herokuapp.com/Runtime').subscribe(data => { //from Ogel.Runtime.csv converted to OgelRuntime.json
      this.runtimeContent = data.slice();
    })
  }
  getServiceData(): void { //getting info about selected machine and date
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
  }
  scrapAndProductionSum(): void { //calculating gross production and scrap sum
    if (this.productionContent && (this.previousMachine !== this.machine || this.previousDate !== this.date)) {
      this.grossProduction = 0;
      this.scrapProduction = 0;
      for (let item of this.productionContent) {
        if (item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date) {
          if (item.variable_name === "PRODUCTION") {
            this.grossProduction += parseInt(item.value);
          }
          if (item.variable_name === "SCRAP") {
            this.scrapProduction += parseInt(item.value);
          }
        }
      }
    }
  }
  currentMinusLastDate(curr: string, last: string): string { //time difference between two dates calculations
    let now = moment(curr);
    let then = moment(last);
    let ms = moment(now, "YYYY-MM-DD HH:mm:ss").diff(moment(then, "YYYY-MM-DD HH:mm:ss"));
    let d = moment.duration(ms);
    let s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
    return s;
  }
  hoursMinutesAndSecondsCalc(s: string): void { //calculations from time difference string
    this.hours = s.substr(0, 1);
    this.minutes = s.substr(2, 2);
    if (parseInt(this.minutes) < 10) {
      this.minutes = s.substr(3, 1);
    }
    this.seconds = s.substr(5, 2);
    if (parseInt(this.seconds) < 10) {
      this.seconds = s.substr(6, 1);
    }
  }
  runOrDownTimeSum(type: string): void {
    if (type === 'runtime') {
      this.runtime += (60 * parseInt(this.hours));
      this.runtime += parseInt(this.minutes);
      this.runtime += (parseInt(this.seconds) / 60);
    } else if (type === 'downtime') {
      this.downtime += (60 * parseInt(this.hours));
      this.downtime += parseInt(this.minutes);
      this.downtime += (parseInt(this.seconds) / 60);
    }
  }
  runtimeAndDowntimeCalculating(): void { // calculating sum of runtime and sum of downtime
    if (this.runtimeContent && (this.previousMachine !== this.machine || this.previousDate !== this.date)) {
      this.runtime = 0;
      this.downtime = 0;
      let currentDate: string, lastOne: string, lastZero: string;
      let lastDate: string = "01/01/2018 00:00:00";
      for (let item of this.runtimeContent) {
        if (item.machine_name === this.machine && item.datetime.substr(0, 10) === this.date) {
          if (item.isrunning === "1") {
            currentDate = "01/01/2018 " + item.datetime.substr(11,);
            lastOne = currentDate;
            let s = this.currentMinusLastDate(currentDate, lastDate);
            this.hoursMinutesAndSecondsCalc(s);
            this.runOrDownTimeSum('downtime');
            lastDate = currentDate;
          }
          if (item.isrunning === "0") {
            currentDate = "01/01/2018 " + item.datetime.substr(11,);
            lastZero = currentDate;
            let s = this.currentMinusLastDate(currentDate, lastDate);
            this.hoursMinutesAndSecondsCalc(s);
            this.runOrDownTimeSum('runtime');
            lastDate = currentDate;
          }
        }
      }
      if ((parseInt(lastOne.substr(11, 2)) === parseInt(lastZero.substr(11, 2))) && ((parseInt(lastOne.substr(14, 2)) >= parseInt(lastZero.substr(14, 2))))) {
        let s = this.currentMinusLastDate("01/01/2018 24:00:00", lastOne);
        this.hoursMinutesAndSecondsCalc(s);
        this.runOrDownTimeSum('runtime');
      }
      else if ((parseInt(lastOne.substr(11, 2)) > parseInt(lastZero.substr(11, 2)))) {
        let s = this.currentMinusLastDate("01/01/2018 24:00:00", lastOne);
        this.hoursMinutesAndSecondsCalc(s);
        this.runOrDownTimeSum('runtime');
      }
      else if ((parseInt(lastZero.substr(11, 2)) === parseInt(lastOne.substr(11, 2))) && ((parseInt(lastZero.substr(14, 2)) >= parseInt(lastOne.substr(14, 2))))) {
        let s = this.currentMinusLastDate("01/01/2018 24:00:00", lastZero);
        this.hoursMinutesAndSecondsCalc(s);
        this.runOrDownTimeSum('downtime');
      }
      else if ((parseInt(lastZero.substr(11, 2)) > parseInt(lastOne.substr(11, 2)))) {
        let s = this.currentMinusLastDate("01/01/2018 24:00:00", lastZero);
        this.hoursMinutesAndSecondsCalc(s);
        this.runOrDownTimeSum('downtime');
      }
    }
  }
  finalCalculations(): void { //calculations for displaying final data in table (with rounding to 2 decimal places)
    this.performance = (this.grossProduction * 100 / 30000 / 24).toFixed(2);
    this.availability = ((this.runtime * 100 / 60) / ((this.downtime + this.runtime) / 60) / (0.75)).toFixed(2);
    this.quality = (((this.grossProduction - this.scrapProduction) * 100) / (this.grossProduction)).toFixed(2);
    this.oee = ((this.grossProduction / 30000 / 24) * ((this.runtime / 60) / ((this.downtime + this.runtime) / 60) / (0.75)) * (((this.grossProduction - this.scrapProduction)) / (this.grossProduction)) * 100).toFixed(2);
  }
  ngOnInit(): void {
    this.arraysInit();
    this.getServiceData();
    setInterval(() => {
      this.getServiceData();
      this.loadingFlag = false;
      this.scrapAndProductionSum();
      this.runtimeAndDowntimeCalculating();
      this.finalCalculations();
      this.previousMachine = this.machine;
      this.previousDate = this.date;
    }, 500)
  }
}
