import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from "./shared/components/loading/loading";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  protected readonly title = signal('small-shop-managerment');
  isLoading = signal(true);

  constructor() {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 2000);
  }
}
