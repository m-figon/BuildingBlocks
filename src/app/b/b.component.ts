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
  //temperature
  ngOnInit(): void {
    this.machine = this.appService.getMachine();
    this.date = this.appService.getDate();
    setInterval(()=>{
      this.machine=this.appService.getMachine();
      this.date=this.appService.getDate();
    },3000)
    this.http.get<any>('https://building-blocks-assessment.herokuapp.com/Production').subscribe(data => {
      console.log(data);
  })
  }
}
