import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public machine:string;
  public day:string;
  public month:string;
  public year:string;
  constructor() { }
  setSearch(machineVal:string, dayVal:string, monthVal:string, yearVal:string){
    this.machine = machineVal;
    this.day=dayVal;
    this.month=monthVal;
    this.year=yearVal;
    console.log(this.machine);
    console.log(this.day);
    console.log(this.month);
    console.log(this.year);
  }
}
