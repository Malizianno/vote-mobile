import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Election } from '../model/election.model';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private imageData = new BehaviorSubject<string | null>(null);
  imageData$ = this.imageData.asObservable();

  private selectedElection = new BehaviorSubject<Election | null>(null);
  selectedElection$ = this.selectedElection.asObservable();

  setSelectedElection(election: Election | null) {
    this.selectedElection.next(election);
  }

  setImage(data: string | null) {
    this.imageData.next(data);
  }

  clearImage() {
    this.imageData.next(null);
  }

  clearSelectedElection() {
    this.selectedElection.next(null);
  }

  clearAll() {
    this.clearImage();
    this.clearSelectedElection();
  }
}
