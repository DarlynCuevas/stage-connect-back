import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genre?: string[];

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'basePrice must be greater than or equal to 0' })
  basePrice?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsNumber()
  managerId?: number;

  @IsOptional()
  socialLinks?: { 
    instagram?: string; 
    youtube?: string; 
    spotify?: string; 
    tiktok?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  // Credibilidad y Experiencia
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  // Multimedia
  @IsOptional()
  @IsString()
  showreelUrl?: string;

  @IsOptional()
  @IsString()
  spotifyUrl?: string;

  @IsOptional()
  @IsString()
  youtubeChannel?: string;

  // Información Técnica
  @IsOptional()
  @IsString()
  technicalRider?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsString()
  setupTime?: string;

  // Cobertura
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverageAreas?: string[];

  @IsOptional()
  @IsBoolean()
  willingToTravel?: boolean;

  // Profesional
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  performanceTypes?: string[];

  @IsOptional()
  @IsString()
  audienceSize?: string;

  @IsOptional()
  @IsString()
  setDuration?: string;

  // Manager-specific fields
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @IsOptional()
  @IsNumber()
  currentArtists?: number;

  @IsOptional()
  @IsNumber()
  totalShowsManaged?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  totalReviews?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @IsOptional()
  @IsString()
  commissionRate?: string;

  @IsOptional()
  @IsBoolean()
  internationalBooking?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolio?: string[];

  @IsOptional()
  @IsBoolean()
  acceptingArtists?: boolean;

  @IsOptional()
  @IsString()
  responseTime?: string;

  // Promoter-specific fields
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsNumber()
  totalEventsOrganized?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  musicGenres?: string[];

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsBoolean()
  hasVenues?: boolean;

  @IsOptional()
  @IsBoolean()
  providesMarketing?: boolean;

  @IsOptional()
  @IsBoolean()
  providesSponsorship?: boolean;

  @IsOptional()
  @IsBoolean()
  internationalEvents?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featuredEvents?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  artistsWorkedWith?: string[];

  @IsOptional()
  @IsBoolean()
  acceptingProjects?: boolean;

  @IsOptional()
  @IsString()
  preferredProjectSize?: string;
}
