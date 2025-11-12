import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Candidate } from '../model/candidate.model';
import { Paging } from '../model/paging.model';
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

  getAll(candidate: Candidate, paging: Paging): Observable<Candidate[]> {
    const filter = {
      candidate,
      paging: { page: paging.page - 1, size: paging.size },
    };

    return this.http.post<Candidate[]>(this.apiURL + '/all', filter, {
      headers: this.headers,
    });
  }
}
