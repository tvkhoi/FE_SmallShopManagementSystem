import { CommonModule } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Button } from "../button/button";
import { Component, EventEmitter, Input, Output } from '@angular/core';


export interface DropdownAction {
  label: string;
  icon?: string;
  type?: 'primary' | 'cancel' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  emitName: string; 
}

interface ActionEvent {
  action: string;
  data: any;
}

@Component({
  selector: 'app-action-dropdown',
  standalone: true,
  imports: [CommonModule, NzDropDownModule, NzIconModule, NzMenuModule, Button],
  templateUrl: './action-dropdown.html',
  styleUrl: './action-dropdown.scss',
})
export class ActionDropdown {
  @Input() actions: DropdownAction[] = [];
  @Input() dropdownLabel: string = 'Hành động';
  @Input() dropdownIcon: string = 'setting';
  @Input() data: any;  

  @Output() action = new EventEmitter<ActionEvent>();

  triggerAction(emitName: string) {
    this.action.emit({ action: emitName, data: this.data });
  }
}
