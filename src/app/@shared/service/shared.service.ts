import { Injectable } from "@angular/core";
import { Election } from "../model/election.model";

@Injectable({ providedIn: 'root' })
export class SharedService {
  private imageData: string | null = null;
  private selectedElection: Election | null = null;

  setSelectedElection(election: Election) {
    this.selectedElection = election;
  }

  getSelectedElection(): Election | null {
    return this.selectedElection;
  }

  clearSelectedElection() {
    this.selectedElection = null;
  }

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
    this.selectedElection = null;
  }
}
