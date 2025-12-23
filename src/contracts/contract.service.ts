import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
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

    // Usar ruta absoluta en la raíz del proyecto
    const pdfDir = path.resolve(process.cwd(), 'contracts');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, `contract-${bookingRequestId}.pdf`);

    // Crear el PDF con pdfkit
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Construir el contenido del contrato
    doc.fontSize(18).text('CONTRATO DE PRESTACIÓN DE SERVICIOS MUSICALES', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Empresa: [Nombre de tu empresa], CIF: [CIF empresa]`);
    doc.moveDown();
    doc.text(`Local: ${request.requester?.name || ''}`);
    if (requesterFiscal) {
      doc.text(`${requesterFiscal.razonSocial || ''}`);
      doc.text(`NIF: ${requesterFiscal.dniNif}`);
      doc.text(`${requesterFiscal.direccion}, ${requesterFiscal.ciudad}, ${requesterFiscal.provincia}, ${requesterFiscal.codigoPostal}, ${requesterFiscal.pais}`);
    }
    doc.moveDown();
    doc.text(`Artista: ${request.artist?.name || ''}`);
    if (artistFiscal) {
      doc.text(`${artistFiscal.razonSocial || ''}`);
      doc.text(`NIF: ${artistFiscal.dniNif}`);
      doc.text(`${artistFiscal.direccion}, ${artistFiscal.ciudad}, ${artistFiscal.provincia}, ${artistFiscal.codigoPostal}, ${artistFiscal.pais}`);
    }
    doc.moveDown();
    doc.text(`Fecha: ${request.eventDate}`);
    doc.text(`Horario: ${request.horaInicio || '--:--'} - ${request.horaFin || '--:--'}`);
    doc.text(`Lugar: ${request.eventLocation}`);
    doc.text(`Tipo de evento: ${request.eventType}`);
    doc.text(`Honorarios: €${request.offeredPrice}`);
    doc.moveDown();
    doc.fontSize(14).text('Condiciones', { underline: true });
    doc.fontSize(12).list([
      'El Local abonará el importe a la empresa intermediaria antes del evento.',
      'La empresa transferirá el pago al artista tras la actuación, descontando la comisión.',
      'El artista se compromete a cumplir el rider técnico adjunto.'
    ]);
    doc.moveDown();
    doc.text('Aceptación digital: Este contrato se considera aceptado digitalmente por ambas partes a través de la plataforma.');

    doc.end();

    // Esperar a que el PDF se termine de escribir
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Guardar la ruta en la base de datos
    request.contractPdfUrl = pdfPath;
    await this.bookingRequestRepo.save(request);

    return pdfPath;
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
