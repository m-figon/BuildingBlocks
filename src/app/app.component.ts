import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'building-blocks-assessment';
  machine: string = "";
  day: string = "";
  month: string = "";
  year: string = "";
  tmp: any[] = [];
  machineNames: string[]=[];
  machineFlag=false;
  constructor(private http: HttpClient, private appService: AppService) { }
  array(n: number, startFrom: number): number[] {
    return [...Array(n).keys()].map(i => i + startFrom);
  }
  invertedArray(n: number, startFrom: number): number[] {
    return [...Array(n).keys()].map(i => startFrom - i);
  }
  ngOnInit(): void {
    this.http.get<any>('https://building-blocks-backend.herokuapp.com/Production').subscribe(data => {
      this.tmp = data.slice();
      for(let item of this.tmp){
        let flag=true;
        for(let elem of this.machineNames){ 
          if(item.machine_name===elem){ //check if machine name is already in array
            flag=false;
            break;
          }
        }
        if(flag){
          this.machineNames.push(item.machine_name); //add machine names from json file to machine select
        }
      }
      console.log(this.machineNames);
      this.machineFlag=true;
    })
  }
  searchFunc() {
    this.appService.setSearch(this.machine, this.day, this.month, this.year); //set search values in service
  }
}
