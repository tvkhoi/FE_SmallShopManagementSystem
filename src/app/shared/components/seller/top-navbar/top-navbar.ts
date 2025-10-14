import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-top-navbar',
  imports: [],
  templateUrl: './top-navbar.html',
  styleUrl: './top-navbar.scss',
  standalone: true
})
export class TopNavbar {
  private readonly authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
  get userEmail(): string | null {
    return this.authService.getEmail();
  }

  get userName(): string | null {
    return this.authService.getName();
  }
}
