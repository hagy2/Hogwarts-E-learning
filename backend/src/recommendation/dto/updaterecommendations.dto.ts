export class UpdateRecommendationDto {
  recommendation_id?: string;
  user_id?: string;
  recommended_items?: string[];
  generated_at?: Date;
}