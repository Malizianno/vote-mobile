import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-election-active',
  templateUrl: './election-active.component.html',
  styleUrls: ['./election-active.component.scss'],
  standalone: true,
})
export class ElectionActiveComponent implements OnInit {
  @Input() name?: string;
  @Input() description?: string;
  @Input() link?: string;

  constructor() { }

  ngOnInit() {}

}
