import cors from 'cors';
import xp from 'express';
import * as bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as path from 'path';
import { Mdw, MdwIn, PassiveMdw } from './middleware';

export class Xprest {
  private readonly api = xp();

  constructor() {
    this.api.use(cors());
    this.api.use(bodyParser.json());
    this.api.engine('html', ejs.renderFile);
    this.api.engine('js', ejs.renderFile);
  }

  /**
   * Applies global middleware. Example uses include providing default headers,
   * logging, etc.
   * @param handlers 
   */
  global(...handlers: PassiveMdw<any>[]) {
    const procs = handlers.map((p) => this.convert(p));
    this.api.use(procs);
  }

  /**
   * Specifies a static file resource.
   * @param apiRoute The api route.
   * @param localPath The file path, relative to the cwd.
   */
  resource<TReq>(
    apiRoute: string,
    localPath: string,
    mdwPre?: PassiveMdw<TReq>[],
    mdwPost?: PassiveMdw<TReq>[]
  ): void {
    const inner: xp.RequestHandler = (req, res, next) => {
      res.sendFile(path.resolve(process.cwd(), localPath));
    };

    const procs = [inner];
    if (mdwPre) procs.unshift(...mdwPre.map((p) => this.convert(p)));
    if (mdwPost) procs.push(...mdwPost.map((p) => this.convert(p)));

    this.api.get(apiRoute, ...procs);
  }

  /**
   * Specifies a dynamic file resource.
   * @param apiRoute The api route.
   * @param localPath The file path, relative to the cwd.
   * @param variables Exposed in the rendering of the file. For example:
   *  <%= new Date().getTime() * myVar.myProp %>
   */
  render<TReq>(
    apiRoute: string,
    localPath: string,
    variables: object,
    mdwPre?: PassiveMdw<TReq>[],
    mdwPost?: PassiveMdw<TReq>[]
  ): void {
    const inner: xp.RequestHandler = (req, res, next) => {
      res.render(path.resolve(process.cwd(), localPath), variables);
    };

    const procs = [inner];
    if (mdwPre) procs.unshift(...mdwPre.map((p) => this.convert(p)));
    if (mdwPost) procs.push(...mdwPost.map((p) => this.convert(p)));

    this.api.get(apiRoute, ...procs);
  }

  /**
   * Specifies a restful api endpoint.
   * @param apiRoute The api route.
   * @param verb The verb.
   * @param handler Handles requests.
   */
  endpoint<TReq, TRes>(
    apiRoute: string,
    verb: 'post' | 'get' | 'patch' | 'delete' | 'put',
    ...handlers: Mdw<TReq, TRes>[]
  ): void {
    const procs = handlers.map((p) => this.convert(p));
    this.api[verb](apiRoute, ...procs);
  }

  /**
   * Starts listening for the specified requests.
   * @param port The port.
   * @param onready Called once listening is in place.
   */
  start(port: number, onready?: () => void): void {
    this.api.listen(port, onready);
  }

  /** Converts middleware functions to express-style handlers. */
  private convert<TReq, TRes>(mdw: Mdw<TReq, TRes>): xp.RequestHandler {
    return (hReq, hRes, next) => {
      let dataOut: TRes;
      const subIn: MdwIn<TReq> = {
        data: { ...hReq.body, ...hReq.query, ...hReq.params },
        requestHeaders: hReq.headers,
        responseHeaders: hRes.getHeaders(),
        status: hRes.statusCode,
      };
      try {
        dataOut = mdw(subIn) as TRes;
      } catch (ex) {
        const e = typeof ex === 'string' ? ex : ex.data ?? ex.message ?? 'Internal Server Error';
        hRes.statusCode = ex.status ?? 500;
        if (!hRes.headersSent) hRes.send({ error: e });
        else console.warn('Unable to set error - already sent', ex);
        return; // ensure no further actions
      }

      const updateKeys = Object.keys(subIn.responseHeaders).filter(
        (k) => !hRes.hasHeader(k) || hRes.getHeader(k) !== subIn.responseHeaders[k]
      );
      const deleteKeys = Object.keys(hRes.getHeaders()).filter((k) => !subIn.responseHeaders[k]);

      if (!hRes.headersSent) {
        updateKeys.forEach((k) => hRes.setHeader(k, subIn.responseHeaders[k]));
        deleteKeys.forEach((k) => hRes.removeHeader(k));
        if (subIn.status !== hRes.statusCode) hRes.statusCode = subIn.status;
        if (dataOut !== undefined) hRes.send(dataOut);
      } else {
        const delta = updateKeys.concat(deleteKeys);
        if (delta.length > 0) console.warn('Unable to edit headers - already sent', delta);
        if (subIn.status !== hRes.statusCode) console.warn('Unable to set status - already sent');
        if (dataOut !== undefined) console.warn('Unable to send data - already sent', dataOut);
      }

      next();
    };
  }
}
