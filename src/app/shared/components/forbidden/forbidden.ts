import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from "../admin/button/button";

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.html',
  styleUrls: ['./forbidden.scss'],
  imports: [Button],
})
export class Forbidden {
private readonly router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    window.history.back();
  }
}
