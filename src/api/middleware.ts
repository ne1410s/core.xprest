declare type XHeaders = Record<string, string | string[] | number>;

export interface MdwIn<TReq> {
  data: TReq;
  requestHeaders: XHeaders;
  responseHeaders: XHeaders;
  status: number;
}

export class PipelineError extends Error {
  constructor(public readonly status: number, public readonly data: any, message?: string) {
    super(message);
  }
}

/**
 * Http middleware. Expects object returned in a single 'main' handler only and
 * any 'passive' handlers not returning anything. To terminate the pipeline just
 * throw a PipelineError from any handler.
 * @throws PipelineError
 */
export declare type Mdw<TReq, TRes> = (sub: MdwIn<TReq>) => TRes | void;
