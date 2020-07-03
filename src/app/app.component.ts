import { Component } from '@angular/core';

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
  arrayThree(n: number, startFrom: number): number[] {
    return [...Array(n).keys()].map(i => i + startFrom);
  }
}
