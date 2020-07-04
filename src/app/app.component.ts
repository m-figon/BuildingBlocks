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
  constructor(private http: HttpClient, private appService: AppService) { }
  array(n: number, startFrom: number): number[] {
    return [...Array(n).keys()].map(i => i + startFrom);
  }
  ngOnInit(): void {
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Production').subscribe(data => {
      this.tmp = data.slice();
      console.log(this.tmp);
      for(let item of this.tmp){
        let flag=true;
        for(let elem of this.machineNames){
          if(item.machine_name===elem){
            flag=false;
            break;
          }
        }
        if(flag){
          this.machineNames.push(item.machine_name);
        }
      }
      console.log(this.machineNames);
    })


  }

  searchFunc() {
    this.appService.setSearch(this.machine, this.day, this.month, this.year);
  }
}
