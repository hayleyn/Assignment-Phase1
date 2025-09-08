// app.component.ts
// this file defines the root AppComponent of the application
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// AppComponent class definition
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent {}
