import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-comp-btn',
  imports: [],
  templateUrl: './comp-btn.html',
  styleUrl: './comp-btn.scss'
})
export class CompBtn {
  isHovered = false;
  isPressed = false;
  isContextMenuOpen = false;

  @HostListener('mouseenter') onMouseEnter()
  {
    this.isHovered = true;
  }

  @HostListener('mouseleave') onMouseLeave()
  {
    this.isHovered = false;
  }

  @HostListener('mousedown') onMouseDown()
  {
    this.isPressed = true;
  }

  @HostListener('mouseup') onMouseUp()
  {
    this.isPressed = false;
  }

  onContextMenu(event: any)
  {
    event.preventDefault();
    this.isContextMenuOpen = !this.isContextMenuOpen;
  }
}
