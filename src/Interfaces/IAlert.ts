export interface IAlert {
  id: string;
  level: number;
  roles: string;
  identifier: string;
  title: string;
  text: string;
  createDate: string;
  creator: string;
  startDate: string;
  endDate: string;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
  acknowledgedOn: string;
}
