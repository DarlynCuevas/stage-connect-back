import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ContractService } from './contract.service';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

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
      const fileName = pdfPath.split(path.sep).pop() || `contrato-${bookingRequestId}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      fs.createReadStream(pdfPath).pipe(res);
    } catch (err) {
      throw new HttpException('Error generating contract PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
