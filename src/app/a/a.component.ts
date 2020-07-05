import { Component, OnInit, ViewChild  } from '@angular/core';
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
  public production: number = 0;
  public scrap: number = 0;
  public productionArray: number[]=[];
  public scrapArray: number[]=[];
  public totalArray: number[]=[];
  public runtime: number = 0;
  public downtime: number = 0;
  public productionContent: any[];
  public runtimeContent: any[];
  public previousMachine:string="test";
  public previousDate: string="test";
  public scrapPercentage:string;
  public grossPercentage:string;
  public downtimePercentage:string;
  public loadingFlag:boolean=true;
  ngOnInit(): void {
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
    setInterval(() => {
      this.machine = this.appService.getMachine();
      this.date = this.appService.getDate();
      this.loadingFlag=false;
      if (this.productionContent && (this.previousMachine!==this.machine || this.previousDate!==this.date)) {
        this.production = 0;
        this.scrap = 0;
        for (let item of this.productionContent) {
          if (item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date) {
            if (item.variable_name === "PRODUCTION") {
              this.production += parseInt(item.value);
            }
            if (item.variable_name === "SCRAP") {
              this.scrap += parseInt(item.value);
            }
          }
        }
      }
      if (this.productionContent && (this.previousMachine!==this.machine || this.previousDate!==this.date)) {
        this.productionArray = [];
        this.scrapArray = [];
        this.totalArray = [];
        for(let i=0; i<24;i++){
          this.productionArray[i]=0;
          this.scrapArray[i]=0;
          if(i<10){
            for (let item of this.productionContent) {
            if (item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date && (item.datetime_from.substr(11,2))==="0"+i) {
                if (item.variable_name === "PRODUCTION") {
                  this.productionArray[i] += parseInt(item.value);
                }
                if (item.variable_name === "SCRAP") {
                  this.scrapArray[i] += parseInt(item.value);
                }
            }
          }
          }
          if(i>=10){
            for (let item of this.productionContent) {
            if (item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date && parseInt(item.datetime_from.substr(11,2))===i) {
                if (item.variable_name === "PRODUCTION") {
                  this.productionArray[i] += parseInt(item.value);
                }
                if (item.variable_name === "SCRAP") {
                  this.scrapArray[i] += parseInt(item.value);
                }
            }
          }
          }
          this.totalArray[i]=this.productionArray[i]-this.scrapArray[i];
        }
        if(this.previousMachine!==this.machine || this.previousDate!==this.date){
          this.chart = new Chart(this.chartRef.nativeElement, {
          type: 'line',
          data: {
            labels: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23], 
            datasets: [
              {
                data: this.totalArray, 
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
        });
        
        }
        
      }
      if (this.runtimeContent && (this.previousMachine!==this.machine || this.previousDate!==this.date)) {
        this.runtime = 0;
        this.downtime = 0;
        let currentDate;
        let lastDate = "01/01/2018 00:00:00";
        for (let item of this.runtimeContent) {
          if (item.machine_name === this.machine && item.datetime.substr(0, 10) === this.date) {
            if (item.isrunning === "1") { 
              currentDate = "01/01/2018 " + item.datetime.substr(11,);
              let now = moment(currentDate);
              let then = moment(lastDate);
              let ms = moment(now, "YYYY-MM-DD HH:mm:ss").diff(moment(then, "YYYY-MM-DD HH:mm:ss"));
              let d = moment.duration(ms);
              let s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
              //console.log(s);
              let hours = s.substr(0,1);
              this.downtime+=(60*parseInt(hours));
              let minutes = s.substr(2,2);
              if(parseInt(minutes)<10){
                minutes = s.substr(3,1);
              }
              this.downtime+=parseInt(minutes);
              let seconds = s.substr(5,2);
              this.downtime+=(parseInt(seconds)/60);

              lastDate=currentDate;
            }
            if (item.isrunning === "0") {
              currentDate = "01/01/2018 " + item.datetime.substr(11,);
              let now = moment(currentDate);
              let then = moment(lastDate);
              let ms = moment(now, "YYYY-MM-DD HH:mm:ss").diff(moment(then, "YYYY-MM-DD HH:mm:ss"));
              let d = moment.duration(ms);
              let s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
              //console.log(s);
              let hours = s.substr(0,1);
              this.runtime+=(60*parseInt(hours));
              let minutes = s.substr(2,2);
              if(parseInt(minutes)<10){
                minutes = s.substr(3,1);
              }
              this.runtime+=parseInt(minutes);
              let seconds = s.substr(5,2);
              this.runtime+=(parseInt(seconds)/60);
              lastDate=currentDate;
            }

          }
        }
        this.downtimePercentage=(((this.downtime)/(this.runtime+this.downtime))*100).toFixed(2);
        this.scrapPercentage=((this.scrap/this.production)*100).toFixed(2);
        this.grossPercentage=(((this.production-this.scrap)/this.production)*100).toFixed(2);
        console.log('runtime total ' + this.runtime);
        console.log('downtime total ' + this.downtime);
        console.log('production total ' + this.production);
        console.log('scrap total ' + this.scrap);
        console.log('total array ' + this.totalArray);
      }
      this.previousMachine=this.machine;
        this.previousDate=this.date;
    }, 500)
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Production').subscribe(data => {
      this.productionContent = data.slice();
      console.log(this.productionContent);
    })
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Runtime').subscribe(data => {
      this.runtimeContent = data.slice();
      console.log(this.runtimeContent);
    })
  }

}
