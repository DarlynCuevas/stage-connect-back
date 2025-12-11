import { IsIn } from 'class-validator';
import { RequestStatus } from '../request.entity';

export class UpdateRequestStatusDto {
  @IsIn([RequestStatus.ACEPTADA, RequestStatus.RECHAZADA], {
    message: `El estado debe ser '${RequestStatus.ACEPTADA}' o '${RequestStatus.RECHAZADA}'.`,
  })
  status: RequestStatus.ACEPTADA | RequestStatus.RECHAZADA;
}

