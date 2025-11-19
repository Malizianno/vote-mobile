import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Candidate } from '../model/candidate.model';
import { AppConstants } from '../util/app-constants.util';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root',
})
export class CandidateService extends GenericService {
  private apiURL = AppConstants.BASE_URL + '/candidates';

  getOne(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(this.apiURL + `/${id}`, {
      headers: this.headers,
    });
  }

  getAllForElection(electionID: number | undefined): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(
      this.apiURL + `/allForElection/${electionID}`,
      {
        headers: this.headers,
      }
    );
  }
}
