import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-seller-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true,
})
export class Sidebar implements OnInit {
  currentRoute: string = '';

  private readonly router = inject(Router);
  ngOnInit(): void {

    // Ghi nhận route hiện tại khi load lần đầu
    this.currentRoute = this.router.url;

    // Theo dõi thay đổi route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  isActive(path: string): boolean {
    return this.currentRoute.startsWith(path);
  }
}
