import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { Request } from '../requests/request.entity';
import { UserFiscalDataService } from '../users/user-fiscal-data.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Request)
    private readonly bookingRequestRepo: Repository<Request>,
    private readonly userFiscalDataService: UserFiscalDataService,
  ) {}

  async generateContractPdf(bookingRequestId: number): Promise<string> {
    const request = await this.bookingRequestRepo.findOne({
      where: { id: bookingRequestId },
      relations: ['artist', 'requester'],
    });
    if (!request) {
      throw new Error('Request not found');
    }

    const requesterFiscal = request.requester?.user_id ? await this.userFiscalDataService.findByUserId(request.requester.user_id) : null;
    const artistFiscal = request.artist?.user_id ? await this.userFiscalDataService.findByUserId(request.artist.user_id) : null;

    const html = this.buildContractHtml(request, requesterFiscal, artistFiscal);

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Usar ruta absoluta en la raíz del proyecto
      const pdfDir = path.resolve(process.cwd(), 'contracts');
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
      const pdfPath = path.join(pdfDir, `contract-${bookingRequestId}.pdf`);
      await page.pdf({ path: pdfPath, format: 'A4' });
      await browser.close();

      // Guardar la ruta en la base de datos
      request.contractPdfUrl = pdfPath;
      await this.bookingRequestRepo.save(request);

      return pdfPath;
    } catch (err) {
      throw err;
    }
  }

  buildContractHtml(request: Request, requesterFiscal: any, artistFiscal: any): string {
    // Aquí puedes personalizar el HTML con los datos fiscales
    return `
      <html>
      <head><meta charset="utf-8"><title>Contrato de Actuación</title></head>
      <body style="font-family: Arial, sans-serif;">
        <h2>CONTRATO DE PRESTACIÓN DE SERVICIOS MUSICALES</h2>
        <p><b>Empresa:</b> [Nombre de tu empresa], CIF: [CIF empresa]</p>
        <p><b>Local:</b> ${request.requester?.name} <br/>
        ${requesterFiscal ? `${requesterFiscal.razonSocial || ''}<br/>NIF: ${requesterFiscal.dniNif}<br/>${requesterFiscal.direccion}, ${requesterFiscal.ciudad}, ${requesterFiscal.provincia}, ${requesterFiscal.codigoPostal}, ${requesterFiscal.pais}` : ''}</p>
        <p><b>Artista:</b> ${request.artist?.name} <br/>
        ${artistFiscal ? `${artistFiscal.razonSocial || ''}<br/>NIF: ${artistFiscal.dniNif}<br/>${artistFiscal.direccion}, ${artistFiscal.ciudad}, ${artistFiscal.provincia}, ${artistFiscal.codigoPostal}, ${artistFiscal.pais}` : ''}</p>
        <p><b>Fecha:</b> ${request.eventDate}</p>
        <p><b>Horario:</b> ${request.horaInicio || '--:--'} - ${request.horaFin || '--:--'}</p>
        <p><b>Lugar:</b> ${request.eventLocation}</p>
        <p><b>Tipo de evento:</b> ${request.eventType}</p>
        <p><b>Honorarios:</b> €${request.offeredPrice}</p>
        <h3>Condiciones</h3>
        <ul>
          <li>El Local abonará el importe a la empresa intermediaria antes del evento.</li>
          <li>La empresa transferirá el pago al artista tras la actuación, descontando la comisión.</li>
          <li>El artista se compromete a cumplir el rider técnico adjunto.</li>
        </ul>
        <p><b>Aceptación digital:</b> Este contrato se considera aceptado digitalmente por ambas partes a través de la plataforma.</p>
      </body>
      </html>
    `;
  }
}
