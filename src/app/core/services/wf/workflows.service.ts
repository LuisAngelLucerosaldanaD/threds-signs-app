import {inject, Injectable} from '@angular/core';
import {EnvServiceFactory} from '../env/env.service.provider';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IWorkflow} from '../../models/wf/workflow';
import {IResponse} from '../../models/IResponse';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsService {

  private readonly _url: string = EnvServiceFactory().REST_API;
  private readonly _version: string = '/api/v1/';

  private readonly _http: HttpClient = inject(HttpClient);

  public getWorkflows(): Observable<IResponse<IWorkflow[]>> {
    return this._http.get<IResponse<IWorkflow[]>>(this._url + this._version + 'workflows');
  }
}
