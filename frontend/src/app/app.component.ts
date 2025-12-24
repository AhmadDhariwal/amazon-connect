import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
 <!-- <app-navbar></app-navbar> -->
   <router-outlet></router-outlet>
  `

})
export class AppComponent {
  title = 'frontend';
}
