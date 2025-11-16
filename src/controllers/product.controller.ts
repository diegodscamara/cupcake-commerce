import { CupcakeModel, type SortOption } from '@/models/cupcake.model';
import { CategoryModel } from '@/models/category.model';
import { ReviewModel } from '@/models/review.model';

export class ProductController {
  static async getProducts(filters?: {
    categorySlug?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: SortOption;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const offset = (page - 1) * limit;
    const sort = filters?.sort || 'name';

    let cupcakes;
    let total = 0;

    if (filters?.search) {
      cupcakes = await CupcakeModel.search(filters.search, {
        limit,
        offset,
        sort,
      });
      total = await CupcakeModel.countSearch(filters.search);
    } else if (filters?.categorySlug) {
      const category = await CategoryModel.findBySlug(filters.categorySlug);
      if (category) {
        cupcakes = await CupcakeModel.findByCategory(category.id, true, {
          limit,
          offset,
          sort,
        });
        total = await CupcakeModel.countByCategory(category.id, true);
      } else {
        cupcakes = await CupcakeModel.findAll(true, { limit, offset, sort });
        total = await CupcakeModel.count(true);
      }
    } else {
      cupcakes = await CupcakeModel.findAll(true, { limit, offset, sort });
      total = await CupcakeModel.count(true);
    }

    const categories = await CategoryModel.findAll();
    const totalPages = Math.ceil(total / limit);

    return {
      cupcakes,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getProductBySlug(slug: string) {
    const cupcake = await CupcakeModel.findBySlug(slug);
    if (!cupcake) {
      return null;
    }

    const category = cupcake.categoryId
      ? await CategoryModel.findById(cupcake.categoryId)
      : null;

    const reviews = await ReviewModel.findByCupcakeId(cupcake.id);
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return {
      ...cupcake,
      category,
      reviews,
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
    };
  }
}
