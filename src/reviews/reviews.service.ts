import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async findByArtist(artistId: number) {
    return this.reviewsRepository.find({
      where: { artistId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async countReviewsForArtist(artistId: number): Promise<number> {
    return this.reviewsRepository.count({ where: { artistId } });
  }

  async getAverageRatingForArtist(artistId: number): Promise<number> {
    const { avg } = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.artistId = :artistId', { artistId })
      .getRawOne();
    return avg ? parseFloat(avg) : 0;
  }

  async create(createReviewDto: any) {
    const review = this.reviewsRepository.create(createReviewDto);
    return await this.reviewsRepository.save(review);
  }
}
