import { BaseQueryDTO, PageMetaResponse, PageResponse } from '@h.linker/libs';

export class Paginator {
  static async paginate<T>(
    dataQuery: (paginationArgs: { skip: number; take: number }) => Promise<T[]>,
    countQuery: () => Promise<number>,
    query: BaseQueryDTO,
  ): Promise<PageResponse<T>> {
    const page = query.page ?? 1;
    const take = query.take ?? 10;
    const skip = (page - 1) * take;

    const [data, itemCount] = await Promise.all([
      dataQuery({ skip, take }),
      countQuery(),
    ]);

    const meta = new PageMetaResponse({ page, take, itemCount });

    return new PageResponse<T>(data, meta);
  }
}
