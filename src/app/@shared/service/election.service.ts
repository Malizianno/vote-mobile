import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ElectionCampaignDTO } from '../model/campaign.model';
import { Candidate } from '../model/candidate.model';
import { AppConstants } from '../util/app-constants.util';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root',
})
export class ElectionService extends GenericService {
  private apiURL = AppConstants.BASE_URL + '/election/helper';

  getStatus(): Observable<ElectionCampaignDTO> {
    return this.http.get<ElectionCampaignDTO>(this.apiURL + '/status', {
      headers: this.headers,
    });
  }

  getElectionWinner(): Observable<Candidate> {
    return this.http.get<Candidate>(this.apiURL + '/result', {
      headers: this.headers,
    });
  }

  vote(candidate: Candidate, userID: number | null): Observable<boolean> {
    return this.http.post<boolean>(this.apiURL + '/vote', candidate, {
      params: { userID: userID! },
      headers: this.headers,
    });
  }
}
