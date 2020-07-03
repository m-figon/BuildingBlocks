import { Component } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'building-blocks-assessment';
  machine: string = "machine";
  day: string = "day";
  month: string = "month";
  year: string = "year";
  constructor(private appService: AppService){}
  array(n: number, startFrom: number): number[] {
    return [...Array(n).keys()].map(i => i + startFrom);
  }
  searchFunc(){
    this.appService.setSearch(this.machine,this.day,this.month,this.year);
  }
}
