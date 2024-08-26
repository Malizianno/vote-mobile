import { Injectable } from '@angular/core';
import { LoginResponseDTO } from '../model/login.dto';

const credentialsKey = 'credentials';
const hasVotedKey = 'has_voted';
const userIDKey = 'id';

/**
 * Provides storage for authentication credentials.
 * The Credentials interface should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  private _credentials: LoginResponseDTO | null = null;

  constructor() {
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    }
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(): LoginResponseDTO | null {
    return this._credentials;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
  setCredentials(credentials?: LoginResponseDTO) {
    this._credentials = credentials || null;
    const hasVoted = credentials?.hasVoted;
    const userID = credentials?.id;

    if (credentials) {
      localStorage.setItem(credentialsKey, JSON.stringify(credentials));
      localStorage.setItem(hasVotedKey, JSON.stringify(hasVoted));
      localStorage.setItem(userIDKey, JSON.stringify(userID));
    } else {
      sessionStorage.removeItem(credentialsKey);
      sessionStorage.removeItem(hasVotedKey);
      sessionStorage.removeItem(userIDKey);
      localStorage.removeItem(credentialsKey);
      localStorage.removeItem(hasVotedKey);
      localStorage.removeItem(userIDKey);
    }
  }

  setHasVoted(hasVoted: boolean) {
    localStorage.setItem(hasVotedKey, JSON.stringify(hasVoted));
  }

  get hasVoted(): boolean {
    const value = localStorage.getItem(hasVotedKey);
    return (/true/i).test(value!);
  }

  get userID(): number | null {
    const value = localStorage.getItem(userIDKey);
    return value === null ? null : +value;
  }
}
