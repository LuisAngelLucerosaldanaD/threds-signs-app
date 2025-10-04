import {inject, Injectable} from '@angular/core';
import {EnvServiceFactory} from '../env/env.service.provider';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Response} from '../../models/response';
import {ReportSigners} from '../../models/bi/signers';

@Injectable({
  providedIn: 'root'
})
export class BiService {

  private readonly _url: string = EnvServiceFactory().REST_API;
  private readonly _version: string = '/api/v1';

  private readonly _http: HttpClient = inject(HttpClient);

  public getSignersReport(startDate: string | null, endDate: string | null): Observable<Response<ReportSigners>> {
    return this._http.get<Response<ReportSigners>>(`${this._url}${this._version}/bi/report/signers?start_date=${startDate || ''}&end_date=${endDate || ''}`);
  }
}
