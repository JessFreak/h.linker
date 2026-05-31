import 'reflect-metadata';
import { CategoryMapper } from './category.mapper';

describe('CategoryMapper', () => {
  it('should map category entities to a search response', () => {
    const mockCategories = [
      { id: '1', name: 'Web' },
      { id: '2', name: 'AI/ML' },
      { id: '3', name: 'GameDev' },
    ] as any[];

    const result = CategoryMapper.getCategorySearchResponse(mockCategories);

    expect(result.categories).toHaveLength(3);
    expect(result.categories).toEqual(['Web', 'AI/ML', 'GameDev']);
  });
});
