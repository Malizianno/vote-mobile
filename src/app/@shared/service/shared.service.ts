import { Injectable } from "@angular/core";
import { Election } from "../model/election.model";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

@Injectable({ providedIn: 'root' })
export class SharedService {
  private imageData: string | null = null;
  // private selectedElection: Election | null = null;

  private selectedElection = new BehaviorSubject<Election | null>(null);
  selectedElection$ = this.selectedElection.asObservable();

  setSelectedElection(election: Election | null) {
    this.selectedElection.next(election);
  }

  // setSelectedElection(election: Election) {
  //   this.selectedElection = election;
  // }

  // getSelectedElection(): Election | null {
  //   return this.selectedElection;
  // }

  // clearSelectedElection() {
  //   this.selectedElection = null;
  // }

  setImage(data: string) {
    this.imageData = data;
  }

  getImage(): string | null {
    return this.imageData;
  }

  clearImage() {
    this.imageData = null;
  }

  clearAll() {
    this.imageData = null;
    this.selectedElection.next(null);
  }
}
