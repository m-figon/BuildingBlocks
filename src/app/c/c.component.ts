import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';

@Component({
  selector: 'app-c',
  templateUrl: './c.component.html',
  styleUrls: ['./c.component.css']
})
export class CComponent implements OnInit {

  constructor(private http: HttpClient, private appService: AppService) { }
  public machine: string;
  public date: string;
  //production and uptime
  ngOnInit(): void {
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
    setInterval(() => {
      this.machine = this.appService.getMachine();
      this.date = this.appService.getDate();
    }, 500)
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Production').subscribe(data => {
      console.log(data);
    })
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Runtime').subscribe(data => {
      console.log(data);
    })
  }
}
