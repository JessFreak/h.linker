import 'reflect-metadata';
import { BaseQueryDTO } from '@h.linker/libs';
import { Paginator } from './prisma-pagination.util';

describe('Paginator', () => {
  it('should calculate skip and map paginated response correctly', async () => {
    const mockDataQuery = jest.fn().mockResolvedValue(['item1', 'item2']);
    const mockCountQuery = jest.fn().mockResolvedValue(50);

    const query = { page: 3, take: 5 } as BaseQueryDTO;

    const result = await Paginator.paginate(
      mockDataQuery,
      mockCountQuery,
      query,
    );

    // (page 3 - 1) * take 5 = skip 10
    expect(mockDataQuery).toHaveBeenCalledWith({ skip: 10, take: 5 });
    expect(result.data).toEqual(['item1', 'item2']);
    expect(result.meta.page).toBe(3);
    expect(result.meta.take).toBe(5);
    expect(result.meta.itemCount).toBe(50);
    expect(result.meta.pageCount).toBe(10);
  });

  it('should use default pagination values if query parameters are missing', async () => {
    const mockDataQuery = jest.fn().mockResolvedValue([]);
    const mockCountQuery = jest.fn().mockResolvedValue(0);

    const emptyQuery = {} as BaseQueryDTO;

    const result = await Paginator.paginate(
      mockDataQuery,
      mockCountQuery,
      emptyQuery,
    );

    expect(mockDataQuery).toHaveBeenCalledWith({ skip: 0, take: 10 });
    expect(result.meta.page).toBe(1);
    expect(result.meta.take).toBe(10);
  });
});
