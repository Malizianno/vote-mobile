import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-election-active',
  templateUrl: './election-active.component.html',
  styleUrls: ['./election-active.component.scss'],
  standalone: true,
  imports: [TranslateModule],
})
export class ElectionActiveComponent implements OnInit {
  @Input() name?: string;
  @Input() description?: string;
  @Input() link?: string;

  constructor() {}

  ngOnInit() {}
}
