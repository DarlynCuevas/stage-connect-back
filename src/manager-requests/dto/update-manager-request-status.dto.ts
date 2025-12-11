import { IsEnum } from 'class-validator';
import { ManagerRequestStatus } from '../manager-request.entity';

export class UpdateManagerRequestStatusDto {
  @IsEnum(ManagerRequestStatus)
  status: ManagerRequestStatus;
}
