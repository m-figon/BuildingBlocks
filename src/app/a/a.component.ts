import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';
import * as moment from 'moment';
import { Chart } from 'chart.js';


@Component({
  selector: 'app-a',
  templateUrl: './a.component.html',
  styleUrls: ['./a.component.css']
})
export class AComponent implements OnInit {
  @ViewChild('lineChart') private chartRef;
  chart: any;
  constructor(private http: HttpClient, private appService: AppService) { }
  public machine: string;
  public date: string;
  public grossProduction: number = 0;
  public scrapProduction: number = 0;
  private grossProductionArray: number[] = [];
  private scrapProductionArray: number[] = [];
  private totalProductionArray: number[] = [];
  private runtime: number = 0;
  private downtime: number = 0;
  private productionContent: any[];
  private runtimeContent: any[];
  private previousMachine: string = "test";
  private previousDate: string = "test";
  public scrapPercentage: string;
  public grossPercentage: string;
  public downtimePercentage: string;
  public loadingFlag: boolean = true;
  private hours: string;
  private minutes: string;
  private seconds: string;
  getServiceData(): void { //getting info about selected machine and date
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
  }
  arraysInit(): void { //getting data from server
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Production').subscribe(data => { //from Ogel.Production.csv converted to OgelProduction.json
      this.productionContent = data.slice();
    })
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Runtime').subscribe(data => { //from Ogel.Runtime.csv converted to OgelRuntime.json
      this.runtimeContent = data.slice();
    })
  }
  scrapAndProductionSum(): void {//calculating gross production and scrap sum (A part 1,2)
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
  currentMinusLastDate(curr: string, last: string): string {
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
  runOrDownTimeSum(type:string):void {
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
      let currentDate;
      let lastDate = "01/01/2018 00:00:00";
      let lastOne;
      let lastZero;
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
      console.log('last one ' + lastOne);
      console.log('last zero ' + lastZero);
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
  hourScrapAndProductionSum(): void {//calculating gross production and scrap sum for each hour (A part 4)
    if (this.productionContent && (this.previousMachine !== this.machine || this.previousDate !== this.date)) {
      this.grossProductionArray = [];
      this.scrapProductionArray = [];
      this.totalProductionArray = [];
      for (let i = 0; i < 24; i++) {
        this.grossProductionArray[i] = 0;
        this.scrapProductionArray[i] = 0;
        if (i < 10) {
          for (let item of this.productionContent) {
            if (item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date && (item.datetime_from.substr(11, 2)) === "0" + i) {
              if (item.variable_name === "PRODUCTION") {
                this.grossProductionArray[i] += parseInt(item.value);
              }
              if (item.variable_name === "SCRAP") {
                this.scrapProductionArray[i] += parseInt(item.value);
              }
            }
          }
        }
        if (i >= 10) {
          for (let item of this.productionContent) {
            if (item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date && parseInt(item.datetime_from.substr(11, 2)) === i) {
              if (item.variable_name === "PRODUCTION") {
                this.grossProductionArray[i] += parseInt(item.value);
              }
              if (item.variable_name === "SCRAP") {
                this.scrapProductionArray[i] += parseInt(item.value);
              }
            }
          }
        }
        this.totalProductionArray[i] = this.grossProductionArray[i] - this.scrapProductionArray[i]; //difference between gross production and scrap
      }
      this.chart = this.createChart();
    }
  }
  createChart(): Chart { //creating chart of gross production - scrap for every hour (A part 4)
    if (this.previousMachine !== this.machine || this.previousDate !== this.date) {
      return (new Chart(this.chartRef.nativeElement, {
        type: 'line',
        data: {
          labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          datasets: [
            {
              data: this.totalProductionArray, //gross production - scrap for every hour
              borderColor: '#82b8ff',
              fill: false
            }
          ]
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true
            }],
          }
        }
      }));

    }
  }
  finalCalculations(): void { //calculations for displaying final data in table (with rounding to 2 decimal places)
    this.downtimePercentage = (((this.downtime) / (this.runtime + this.downtime)) * 100).toFixed(2);
    this.scrapPercentage = ((this.scrapProduction / this.grossProduction) * 100).toFixed(2);
    this.grossPercentage = (((this.grossProduction - this.scrapProduction) / this.grossProduction) * 100).toFixed(2);
  }
  ngOnInit(): void {
    this.getServiceData();
    setInterval(() => {
      this.getServiceData();
      this.loadingFlag = false;
      this.scrapAndProductionSum();
      this.hourScrapAndProductionSum();
      this.runtimeAndDowntimeCalculating();
      this.finalCalculations();
      this.previousMachine = this.machine;
      this.previousDate = this.date;
    }, 500)
    this.arraysInit();
  }

}