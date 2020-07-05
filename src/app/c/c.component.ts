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
  public production: number = 0;
  public scrap: number = 0;
  public runtime: number = 0;
  public downtime: number = 0;
  public productionContent: any[];
  public runtimeContent: any[];
  public previousMachine:string="test";
  public previousDate: string="test";
  public performance: string;
  public availability: string;
  public quality: string;
  public oee: string;
  //production and uptime
  ngOnInit(): void {
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
    setInterval(() => {
      this.machine = this.appService.getMachine();
      this.date = this.appService.getDate();
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
        this.performance=(this.production*100/30000/24).toFixed(2);
        this.availability=((this.runtime*100/60)/((this.downtime+this.runtime)/60)/(0.75)).toFixed(2);
        this.quality=(((this.production-this.scrap)*100)/(this.production)).toFixed(2);
        this.oee=((this.production/30000/24)*((this.runtime/60)/((this.downtime+this.runtime)/60)/(0.75))*(((this.production-this.scrap))/(this.production))*100).toFixed(2);
        console.log('runtime total ' + this.runtime);
        console.log('downtime total ' + this.downtime);
        console.log('production total ' + this.production);
        console.log('scrap total ' + this.scrap);

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
