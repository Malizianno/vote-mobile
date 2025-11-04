import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class SharedService {
  private imageData: string | null = null;

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
  }
}
