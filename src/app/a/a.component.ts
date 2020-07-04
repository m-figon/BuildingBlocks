import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';
import * as moment from 'moment';

@Component({
  selector: 'app-a',
  templateUrl: './a.component.html',
  styleUrls: ['./a.component.css']
})
export class AComponent implements OnInit {

  constructor(private http: HttpClient, private appService: AppService) { }
  public machine: string;
  public date: string;
  public production: number = 0;
  public scrap: number = 0;
  public runtime: number = 0;
  public downtime: number = 0;
  public productionContent: any[];
  public runtimeContent: any[];
  //production gross and scrap
  ngOnInit(): void {
    /*
    //working test
    let currentDate= "01/01/2018 00:07:00";
    let lastDate = "01/01/2018 00:01:00";
    var now = moment(currentDate);
    var then = moment(lastDate);
    var ms = moment(now,"DD/MM/YYYY HH:mm:ss").diff(moment(then,"DD/MM/YYYY HH:mm:ss"));
    var d = moment.duration(ms);
    var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
    */
    console.log(s);
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
    setInterval(() => {
      this.machine = this.appService.getMachine();
      this.date = this.appService.getDate();
      if (this.productionContent) {
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
        console.log('production total ' + this.production);
        console.log('scrap total ' + this.scrap);
      }
      if (this.runtimeContent) {
        this.runtime = 0;
        this.downtime = 0;
        let currentDate;
        let lastDate = "01/01/2018 " + "00:00:00";
        for (let item of this.runtimeContent) {
          if (item.machine_name === this.machine && item.datetime.substr(0, 10) === this.date) {
            if (item.isrunning === "1") {
              currentDate = "01/01/2018 " + item.datetime;
              var now = moment(currentDate);
              var then = moment(lastDate);
              var ms = moment(now,"YYYY-MM-DD HH:mm:ss").diff(moment(then,"YYYY-MM-DD HH:mm:ss"));
              var d = moment.duration(ms);
              //var s = d.format("hh:mm:ss");  
                          /*
              currentState=item.isrunning;
              currentHours += parseInt(item.datetime.substr(11, 2));
              currentMinutes += parseInt(item.datetime.substr(14, 2));
              */

            }
            /*
            if (item.isrunning === "0") {
              currentState=item.isrunning;
              this.scrap += parseInt(item.value);
            }
            */
          }
        }
        console.log('production total ' + this.production);
        console.log('scrap total ' + this.scrap);
      }
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
