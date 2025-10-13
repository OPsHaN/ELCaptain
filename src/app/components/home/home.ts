import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Nav } from "../../shared/nav/nav";

@Component({
  selector: "app-home",
  imports: [CommonModule, FormsModule, Nav],
  templateUrl: "./home.html",
  styleUrl: "./home.scss",
})
export class Home {
  activeContainer: string | null = null;

  showContainer(type: string) {
    this.activeContainer = type;
  }



}
