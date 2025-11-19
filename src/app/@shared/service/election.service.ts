import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ElectionCampaignDTO } from '../model/campaign.model';
import { Candidate } from '../model/candidate.model';
import { AppConstants } from '../util/app-constants.util';
import { GenericService } from './generic.service';
import { Election } from '../model/election.model';

@Injectable({
  providedIn: 'root',
})
export class ElectionService extends GenericService {
  private apiURL = AppConstants.BASE_URL + '/election';
  private helperApiURL = this.apiURL + '/helper';

  getAll(): Observable<Election[]> {
    return this.http.get<Election[]>(this.apiURL + '/all', {
      headers: this.headers,
    });
  }

  getLast(): Observable<Election> {
    return this.http.get<Election>(this.apiURL + '/last', {
      headers: this.headers,
    });
  }

  getStatus(): Observable<ElectionCampaignDTO> {
    return this.http.get<ElectionCampaignDTO>(this.helperApiURL + '/status', {
      headers: this.headers,
    });
  }

  getElectionWinner(): Observable<Candidate> {
    return this.http.get<Candidate>(this.helperApiURL + '/result', {
      headers: this.headers,
    });
  }

  vote(candidate: Candidate, userID: number | null): Observable<boolean> {
    return this.http.post<boolean>(this.helperApiURL + '/vote', candidate, {
      params: { userID: userID! },
      headers: this.headers,
    });
  }
}
