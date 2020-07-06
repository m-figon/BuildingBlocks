import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';

@Component({
  selector: 'app-b',
  templateUrl: './b.component.html',
  styleUrls: ['./b.component.css']
})
export class BComponent implements OnInit {

  constructor(private http: HttpClient, private appService: AppService) { }
  public machine: string;
  public date: string;
  private productionContent: any[];
  private previousMachine: string = "test";
  private previousDate: string = "test";
  public coreInfo: any[] = [];
  public loadingFlag: boolean = true;

  //temperature
  ngOnInit(): void {
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
    setInterval(() => {
      this.machine = this.appService.getMachine();
      this.date = this.appService.getDate();
      this.loadingFlag = false;
      this.coreInfo=[];
      if (this.productionContent) {
        let coreIndex = 0;
        this.coreInfo[0] = {
          startTime: "00:00:00",
          endTime: "00:05:00",
          status: "good",
          cores: 0
        };
        for (let item of this.productionContent) {
          if (item.variable_name === "CORE TEMPERATURE" && item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date) {
            console.log(item.datetime_from + "/" + item.datetime_to + "/" + item.value);
            if (item.value <= 85) {
              if (this.coreInfo[coreIndex].status === "good") {
                this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
                this.coreInfo[coreIndex].cores = 0;
              }
              else if (this.coreInfo[coreIndex].status === "warning" || this.coreInfo[coreIndex].status === "fatal") {
                coreIndex++;
                this.coreInfo[coreIndex] = {
                  startTime: item.datetime_from.substr(11,),
                  endTime: item.datetime_to.substr(11,),
                  status: "good",
                  cores: 0
                };
              }
            } else if (item.value > 85 && item.value <= 100) {
              if (this.coreInfo[coreIndex].status === "warning") {
                this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
              } else if (this.coreInfo[coreIndex].status === "good") {
                if (this.coreInfo[coreIndex].cores >= 3) {
                  coreIndex++;
                  this.coreInfo[coreIndex] = {
                    startTime: item.datetime_from.substr(11,),
                    endTime: item.datetime_to.substr(11,),
                    status: "warning",
                    cores: 0
                  };
                }
                if (this.coreInfo[coreIndex].cores < 3) {
                  this.coreInfo[coreIndex].cores++;
                  this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
                }
                
              }
              else if (this.coreInfo[coreIndex].status === "fatal") {
                this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
              }
            } else if (item.value > 100) {
              if (this.coreInfo[coreIndex].status === "fatal") {
                this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
              } else if (this.coreInfo[coreIndex].status === "warning" || this.coreInfo[coreIndex].status === "good") {
                coreIndex++;
                this.coreInfo[coreIndex] = {
                  startTime: item.datetime_from.substr(11,),
                  endTime: item.datetime_to.substr(11,),
                  status: "fatal",
                  cores: 0
                };
              }
            }
          }
        }
        //console.log(this.coreInfo);
      }
    }, 500)
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Production').subscribe(data => {
      this.productionContent = data.slice();
      //console.log(this.productionContent);
    })
  }
}
