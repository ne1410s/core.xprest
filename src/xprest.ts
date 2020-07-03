import cors from 'cors';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as path from 'path';

export class Xprest {
  private readonly api = express();

  constructor() {
    this.api.use(cors());
    this.api.use(bodyParser.json());
    this.api.engine('html', ejs.renderFile);
    this.api.engine('js', ejs.renderFile);
  }

  /**
   * Specifies a static file resource.
   * @param apiRoute The api route.
   * @param localPath The file path, relative to the cwd.
   */
  resource(apiRoute: string, localPath: string): void {
    this.api['get'](apiRoute, (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), localPath));
    });
  }

  /**
   * Specifies a dynamic file resource.
   * @param apiRoute The api route.
   * @param localPath The file path, relative to the cwd.
   * @param variables Exposed in the rendering of the file. For example:
   *  <%= new Date().getTime() * myVar.myProp %>
   */
  render(apiRoute: string, localPath: string, variables: object): void {
    this.api['get'](apiRoute, (_req, res) => {
      res.render(path.resolve(process.cwd(), localPath), variables);
    });
  }

  /**
   * Starts listening for the specified requests.
   * @param port The port.
   * @param onready Called once listening is in place.
   */
  start(port: number, onready?: () => void): void {
    this.api.listen(port, onready);
  }

  /**
   * Specifies a restful api endpoint.
   * @param apiRoute The api route.
   * @param verb The verb.
   * @param handler Handles requests.
   */
  endpoint<TReq, TRes>(
    apiRoute: string,
    verb: 'post' | 'get' | 'delete' | 'put',
    handler: (req: TReq) => TRes
  ): void {
    this.api[verb](apiRoute, (req, res) => {
      const inObject = { ...req.body, ...req.query, ...req.params } as TReq;
      const outObject = handler(inObject);
      res.json(outObject);
    });
  }
}
