import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ContractService } from './contract.service';
import type { Response } from 'express';
import * as fs from 'fs';

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get(':bookingRequestId/pdf')
  async getContractPdf(@Param('bookingRequestId') bookingRequestId: string, @Res() res: Response) {
    try {
      const pdfPath = await this.contractService.generateContractPdf(Number(bookingRequestId));
      if (!fs.existsSync(pdfPath)) {
        throw new HttpException('PDF not found', HttpStatus.NOT_FOUND);
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contract-${bookingRequestId}.pdf`);
      fs.createReadStream(pdfPath).pipe(res);
    } catch (err) {
      throw new HttpException('Error generating contract PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
