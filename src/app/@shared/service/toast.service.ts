import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toast: ToastController) {
    // empty
  }

  public async show(message: string, durationMs?: number) {
    const defaultDurationMs = 2000;
    const toast = await this.toast.create({
      message,
      duration: durationMs ? durationMs : defaultDurationMs,
      position: 'top',
      color: 'dark',
    });
    await toast.present();
  }
}
