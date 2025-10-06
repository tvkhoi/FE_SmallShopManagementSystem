import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzHeaderComponent } from 'ng-zorro-antd/layout';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [NzHeaderComponent, NzIconModule, RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit {
  private readonly router = inject(Router);
  @Input() routeMap: { [key: string]: { title: string; icon: string } } = {};
  @Input() currentTitle: string = '';
  @Input() currentIcon: string = '';
  @Input() isMenuVisible: boolean = true;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const path = event.urlAfterRedirects;
        const config = this.routeMap[path];
        if (config) {
          this.currentTitle = config.title;
          this.currentIcon = config.icon;
        }
      });
  }
}
