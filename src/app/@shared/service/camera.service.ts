import { Injectable } from '@angular/core';
import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';

@Injectable({ providedIn: 'root' })
export class CameraService {
  startCamera() {
    const options: CameraPreviewOptions = {
      position: 'rear',
      parent: 'camera-preview',
      className: 'camera-feed',
      toBack: false,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    CameraPreview.start(options);
  }
}
