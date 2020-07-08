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
 * Http middleware, serving as either the single 'main' handler; returning an
 * object or one of many 'passive' handlers; not returning anything. A pipeline
 * can be entirely terminated (prior to the main handler) by throwing an error.
 * A PipelineError can be used to provide response status and data.
 * @throws PipelineError.
 */
export declare type Mdw<TReq, TRes> = (sub: MdwIn<TReq>) => TRes | void;

/**
 * Http passive middleware, which may alter headers and response code - but only
 * prior to the main handler. A pipeline can be entirely terminated (prior to
 * the main handler) by throwing an error. A PipelineError can be used to
 * provide response status and data.
 * @throws PipelineError.
 */
export declare type PassiveMdw<TReq> = (sub: MdwIn<TReq>) => void;
