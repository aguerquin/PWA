import { Injectable } from '@nestjs/common';
import * as webPush from 'web-push';

// const publicVapidKey =
//   'BJcP9a69hdxlcX9Y3E78C2N_yx86x8mUT30vR8Mvv2wcNHSpb7YF7o2dRT_7OlREdnbCLnf40wtJ9h-tadmIy7Q';
// const privateVapidKey = 'uCPHyO_9DR8oAeB0elTZplvpkDWa3nkLbnatXdOWca0';

@Injectable()
export class PushService {
  constructor() {
    webPush.setVapidDetails(
      'mailto:example@yourdomain.org',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
    // webPush.setVapidDetails(
    //     'mailto:exemple@votredomaine.com', // Votre email de contact
    //     publicVapidKey,
    //     privateVapidKey,
    // );
  }

  async sendNotification(subscription, dataToSend: string = '') {
    return webPush.sendNotification(subscription, dataToSend);
  }

  async getVapidPublicKey() {
    return process.env.VAPID_PUBLIC_KEY;
  }
}
