import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('artist/:artistId')
  async getReviewsForArtist(@Param('artistId') artistId: string) {
    return this.reviewsService.findByArtist(Number(artistId));
  }

  @Get('artist/:artistId/count')
  async getArtistReviewsCount(@Param('artistId') artistId: string) {
    const count = await this.reviewsService.countReviewsForArtist(Number(artistId));
    return { artistId: Number(artistId), totalReviews: count };
  }

  @Get('artist/:artistId/average')
  async getArtistAverageRating(@Param('artistId') artistId: string) {
    const avg = await this.reviewsService.getAverageRatingForArtist(Number(artistId));
    return { artistId: Number(artistId), averageRating: avg };
  }

  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    const review = await this.reviewsService.create(createReviewDto);
    return review;
  }
}
