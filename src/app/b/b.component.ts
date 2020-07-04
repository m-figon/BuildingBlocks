import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';

@Component({
  selector: 'app-b',
  templateUrl: './b.component.html',
  styleUrls: ['./b.component.css']
})
export class BComponent implements OnInit {

  constructor(private http: HttpClient,private appService: AppService) { }
  public machine:string;
  public date:string;
  public productionContent:any[];
  public previousMachine:string="test";
  public previousDate: string="test";
  public coreInfo: any[]=[];
  //temperature
  ngOnInit(): void {
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
    setInterval(()=>{
      this.machine=this.appService.getMachine();
      this.date=this.appService.getDate();
      if (this.productionContent){
        let coreIndex=1;
        this.coreInfo[0]={
          startTime: "test",
          endTime: "test",
          status: "test",
          cores: 0
        };
        this.coreInfo[coreIndex]={
          startTime: "",
          endTime: "",
          status: "",
          cores: 0
        };
        for (let item of this.productionContent) {
          if (item.variable_name === "CORE TEMPERATURE" && item.machine_name === this.machine && item.datetime_from.substr(0, 10) === this.date) {
              if(item.value<=85 || (item.value>85 && item.value<=100 && this.coreInfo[coreIndex].cores<3)){
                this.coreInfo[coreIndex].status="good";
                if(this.coreInfo[coreIndex].status!==this.coreInfo[coreIndex-1].status){
                  this.coreInfo[coreIndex].startTime=item.datetime_from.substr(11,);
                  this.coreInfo[coreIndex].endTime=item.datetime_to.substr(11,);
                  coreIndex++;
                  this.coreInfo[coreIndex]={
                    startTime: "",
                    endTime: "",
                    status: "",
                    cores: 0
                  };
                }else if(this.coreInfo[coreIndex].status===this.coreInfo[coreIndex-1].status){
                  this.coreInfo[coreIndex].endTime=item.datetime_to.substr(11,);
                  this.coreInfo[coreIndex].cores++;
                }
              }
              else if((item.value>85 && item.value<=100 && this.coreInfo[coreIndex].cores>=3) || (item.value>100 && this.coreInfo[coreIndex].cores<3)){
                this.coreInfo[coreIndex].status="warning";
                if(this.coreInfo[coreIndex].status!==this.coreInfo[coreIndex-1].status){
                  this.coreInfo[coreIndex].startTime=item.datetime_from.substr(11,);
                  this.coreInfo[coreIndex].endTime=item.datetime_to.substr(11,);
                  coreIndex++;
                  this.coreInfo[coreIndex]={
                    startTime: "",
                    endTime: "",
                    status: "",
                    cores: 0
                  };
                }else if(this.coreInfo[coreIndex].status===this.coreInfo[coreIndex-1].status){
                  this.coreInfo[coreIndex].endTime=item.datetime_to.substr(11,);
                  this.coreInfo[coreIndex].cores++;
                }
              }
              else if(item.value>100 && this.coreInfo[coreIndex].cores>=3){
                this.coreInfo[coreIndex].status="fatal";
                if(this.coreInfo[coreIndex].status!==this.coreInfo[coreIndex-1].status){
                  this.coreInfo[coreIndex].startTime=item.datetime_from.substr(11,);
                  this.coreInfo[coreIndex].endTime=item.datetime_to.substr(11,);
                  coreIndex++;
                  this.coreInfo[coreIndex]={
                    startTime: "",
                    endTime: "",
                    status: "",
                    cores: 0
                  };
                }else if(this.coreInfo[coreIndex].status===this.coreInfo[coreIndex-1].status){
                  this.coreInfo[coreIndex].endTime=item.datetime_to.substr(11,);
                  this.coreInfo[coreIndex].cores++;
                }
              }
          
          }
        }
        console.log(this.coreInfo);
      }
    },500)
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Production').subscribe(data => {
      this.productionContent = data.slice();
      console.log(this.productionContent);
  })
  }
}
