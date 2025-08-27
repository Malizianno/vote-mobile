import { environment } from "src/environments/environment";

export class AppConstants {
    public static BASE_URL = environment.serverUrl;

    public static REFRESH_TIME_MS = 10000; // every 10 seconds
}