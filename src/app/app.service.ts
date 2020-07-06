import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public machine:string;
  public date:string;
  constructor() { }
  setSearch(machineVal:string, dayVal:string, monthVal:string, yearVal:string):void{
    if(dayVal && monthVal && yearVal){
      this.date=yearVal+"-"+monthVal+"-"+dayVal;
    }
    if(machineVal){
      this.machine = machineVal;
    }
  }
  getMachine():string{
    console.log(this.machine);
    return this.machine;
  }
  getDate():string{
    console.log(this.date);
    return this.date;
  }
}
