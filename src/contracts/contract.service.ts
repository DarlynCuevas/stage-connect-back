import { Injectable } from '@nestjs/common';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';
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

    // Construir nombre de archivo descriptivo
    const safeArtist = (request.artist?.name || 'artista').replace(/[^a-zA-Z0-9-_]/g, '_');
    const safeDate = request.eventDate ? String(request.eventDate).slice(0, 10).replace(/[^0-9]/g, '-') : 'fecha';
    const pdfFileName = `contrato-${safeArtist}-${safeDate}-${bookingRequestId}.pdf`;

    // Crear el PDF en memoria
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

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

    // Esperar a que el PDF se termine de generar en memoria
    await new Promise<void>((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });
    const pdfBuffer = Buffer.concat(chunks);

    // Subir a Cloudinary y esperar la URL
    const cloudinaryUrl: string = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `contracts/${pdfFileName}`,
          folder: 'contracts',
          format: 'pdf',
        },
        async (error, result) => {
          if (error) return reject(error);
          if (result && result.secure_url) {
            request.contractPdfUrl = result.secure_url;
            await this.bookingRequestRepo.save(request);
            resolve(result.secure_url);
          } else {
            reject(new Error('No Cloudinary URL'));
          }
        }
      );
      uploadStream.end(pdfBuffer);
    });
    return cloudinaryUrl;
  }

}
