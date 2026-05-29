export interface PageMetaResponseParameters {
  page: number;
  take: number;
  itemCount: number;
}

export class PageMetaResponse {
  readonly page: number;
  readonly take: number;
  readonly itemCount: number;
  readonly pageCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;

  constructor({ page, take, itemCount }: PageMetaResponseParameters) {
    this.page = page;
    this.take = take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export class PageResponse<T> {
  readonly data: T[];
  readonly meta: PageMetaResponse;

  constructor(data: T[], meta: PageMetaResponse) {
    this.data = data;
    this.meta = meta;
  }
}
