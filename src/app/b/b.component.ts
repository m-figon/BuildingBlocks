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
  getServiceData(): void { //getting info about selected machine and date
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
  }
  arraysInit(): void { //getting data from server
    this.http.get<any>('https://building-blocks-backend.herokuapp.com/Production').subscribe(data => { //from Ogel.Production.csv converted to OgelProduction.json
      this.productionContent = data.slice();
    })
  }
  newCoreObject(index: number, start: string, end: string, stat: string) { //creating new core info status object
    this.coreInfo[index] = {
      startTime: start,
      endTime: end,
      status: stat,
      warningCycles: 0
    };
  }
  coreDataCalc(): void {
    this.coreInfo = [];
    if (this.productionContent) {
      let coreIndex: number = 0;
      this.newCoreObject(0,"00:00:00","00:05:00","good");
      for (let item of this.productionContent) { //loop of every object from productionContent array
        if (item.variable_name === "CORE TEMPERATURE" && item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date) {
          if (item.value <= 85) {
            if (this.coreInfo[coreIndex].status === "good") { //continue good status 
              this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
              this.coreInfo[coreIndex].warningCycles = 0;
            }
            else if (this.coreInfo[coreIndex].status === "warning" || this.coreInfo[coreIndex].status === "fatal") { //change status to good
              coreIndex++;
              this.newCoreObject(coreIndex, item.datetime_from.substr(11,), item.datetime_to.substr(11,), "good");
            }
          } else if (item.value > 85 && item.value <= 100) {
            if (this.coreInfo[coreIndex].status === "warning") { //continue warning status
              this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
            } else if (this.coreInfo[coreIndex].status === "good") { //check if required for warning status time passed
              if (this.coreInfo[coreIndex].warningCycles >= 3) { //yes => create warning status
                coreIndex++;
                this.newCoreObject(coreIndex, item.datetime_from.substr(11,), item.datetime_to.substr(11,), "warning");
              }
              if (this.coreInfo[coreIndex].warningCycles < 3) { //no => continue warning status cycles counting
                this.coreInfo[coreIndex].warningCycles++;
                this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
              }
            }
            else if (this.coreInfo[coreIndex].status === "fatal") { //if there was already fatal status continue it
              this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
            }
          } else if (item.value > 100) {
            if (this.coreInfo[coreIndex].status === "fatal") { //if fatal status continue
              this.coreInfo[coreIndex].endTime = item.datetime_to.substr(11,);
            } else if (this.coreInfo[coreIndex].status === "warning" || this.coreInfo[coreIndex].status === "good") { //if good or warning status switch to fatal
              coreIndex++;
              this.newCoreObject(coreIndex, item.datetime_from.substr(11,), item.datetime_to.substr(11,), "fatal")
            }
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.arraysInit();
    this.getServiceData();
    setInterval(() => {
      this.getServiceData();
      this.loadingFlag = false;
      this.coreDataCalc();
    }, 500)
  }
}
