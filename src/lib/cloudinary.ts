import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function getCloudinaryPublicId(url: string): string | null {
  // Extrae el public_id de una URL de Cloudinary
  // Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
  // Resultado: folder/filename
  const match = url.match(/\/upload\/.*?\/([^\.\/]+)\.[a-zA-Z0-9]+$/);
  if (!match) return null;
  // Si tienes carpetas, puedes extraerlas también
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;
  const path = parts[1].split('.')[0];
  return path;
}

export default cloudinary;
