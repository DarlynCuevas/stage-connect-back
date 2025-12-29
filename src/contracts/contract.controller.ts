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
      // Buscar el request en la base de datos
      const request = await this.contractService['bookingRequestRepo'].findOne({ where: { id: Number(bookingRequestId) } });
      let pdfUrl = request?.contractPdfUrl;
      console.log('[PDF] bookingRequestId:', bookingRequestId);
      console.log('[PDF] contractPdfUrl:', pdfUrl);
      if (!pdfUrl) {
        pdfUrl = await this.contractService.generateContractPdf(Number(bookingRequestId));
        console.log('[PDF] generated contractPdfUrl:', pdfUrl);
        if (!pdfUrl) {
          console.error('[PDF] PDF not found after generation');
          throw new HttpException('PDF not found', HttpStatus.NOT_FOUND);
        }
      }
      // Descargar el PDF desde Cloudinary y servirlo como attachment
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          console.error('[PDF] Error fetching PDF from Cloudinary:', response.status, response.statusText);
          throw new HttpException('Error fetching PDF from Cloudinary', HttpStatus.BAD_GATEWAY);
        }
        const buffer = await response.arrayBuffer();
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="contract_${bookingRequestId}.pdf"`,
        });
        return res.send(Buffer.from(buffer));
      } catch (fetchErr) {
        console.error('[PDF] Fetch error:', fetchErr);
        throw new HttpException('Error fetching PDF from Cloudinary', HttpStatus.BAD_GATEWAY);
      }
    } catch (err) {
      console.error('[PDF] General error:', err);
      throw new HttpException('Error generating or downloading contract PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
