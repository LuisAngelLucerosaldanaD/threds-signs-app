export interface ReportSigners {
  signed: number;
  unsigned: number;
  pending: number;
}


export interface IReportSigners {
  signed: {
    count: number;
    percentage: number;
  };
  unsigned: {
    count: number;
    percentage: number;
  };
  pending: {
    count: number;
    percentage: number;
  };
}
