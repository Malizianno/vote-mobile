import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotePage } from './vote.page';

describe('VotePage', () => {
  let component: VotePage;
  let fixture: ComponentFixture<VotePage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(VotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
