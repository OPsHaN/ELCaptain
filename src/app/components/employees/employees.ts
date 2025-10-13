import { Component } from '@angular/core';
import { Register } from "../register/register";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  imports: [Register , CommonModule],
  templateUrl: './employees.html',
  styleUrl: './employees.scss'
})
export class Employees {

    activeTable: string | null = null;

    toggleTable(type: string) {
    if (this.activeTable === type) {
      this.activeTable = null;
    } else {
      this.activeTable = type;
    }
  }

}
