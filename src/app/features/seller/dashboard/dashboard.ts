import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { getGreetingByTime } from '../../../core/utils';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
   greeting = signal('');

  ngOnInit() {
    this.greeting.set(getGreetingByTime());
  }

  get userName(): string | null {
    return this.authService.getName();
  }
}
