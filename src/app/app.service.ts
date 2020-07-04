import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public machine:string;
  public date:string;
  constructor() { }
  setSearch(machineVal:string, dayVal:string, monthVal:string, yearVal:string){
    if(dayVal && monthVal && yearVal){
      this.date=yearVal+"-"+monthVal+"-"+dayVal;
    }
    if(machineVal){
      this.machine = machineVal;
    }

  }
  getMachine(){
    console.log(this.machine);
    return this.machine;
  }
  getDate(){
    console.log(this.date);
    return this.date;
  }
}
