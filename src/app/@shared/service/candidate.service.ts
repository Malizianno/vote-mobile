import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '../util/app-constants.util';
import { Candidate } from '../model/candidate.model';
import { Paging } from '../model/paging.model';
import { Observable } from 'rxjs';
import { CandidateResponse } from '../model/candidate-response.dto';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private apiURL = AppConstants.BASE_URL + '/candidates';

  constructor(private http: HttpClient) { }

  getOne(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(this.apiURL + `/${id}`, {});
  }

  getFiltered(candidate: Candidate, paging: Paging): Observable<CandidateResponse> {
    const filter = { candidate, paging: { page: paging.page - 1, size: paging.size } };

    return this.http.post<CandidateResponse>(this.apiURL + '/filtered', filter, {});
  }
}
