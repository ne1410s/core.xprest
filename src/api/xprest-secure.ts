import { Xprest } from './xprest';
import { JwtIssuer } from '../security/jwt-issuer';
import { JwtToken } from '../security/jwt-token';
import { Mdw, PipelineError } from './middleware';

export class XprestSecure extends Xprest {
  constructor(private readonly jwtIssuer: JwtIssuer) {
    super();
  }

  /**
   * Specifies a (secure) static file resource.
   * @param apiRoute The api route.
   * @param localPath The file path, relative to the cwd.
   */
  resourceSecure<TReq, TRes>(
    apiRoute: string,
    localPath: string,
    roles: string[],
    mdwPre?: Mdw<TReq, TRes>[],
    mdwPost?: Mdw<TReq, TRes>[]
  ): void {
    mdwPre.unshift(this.mdw_CheckRole(roles));
    super.resource(apiRoute, localPath, mdwPre, mdwPost);
  }

  /**
   * Specifies a (secure) dynamic file resource.
   * @param apiRoute The api route.
   * @param localPath The file path, relative to the cwd.
   * @param variables Exposed in the rendering of the file. For example:
   *  <%= new Date().getTime() * myVar.myProp %>
   */
  renderSecure<TReq, TRes>(
    apiRoute: string,
    localPath: string,
    variables: object,
    roles: string[],
    mdwPre?: Mdw<TReq, TRes>[],
    mdwPost?: Mdw<TReq, TRes>[]
  ): void {
    mdwPre.unshift(this.mdw_CheckRole(roles));
    super.render(apiRoute, localPath, variables, mdwPre, mdwPost);
  }

  /**
   * Specifies a (secure) restful api endpoint.
   * @param apiRoute The api route.
   * @param verb The verb.
   * @param handler Handles requests.
   */
  endpointSecure<TReq, TRes>(
    apiRoute: string,
    verb: 'post' | 'get' | 'patch' | 'delete' | 'put',
    roles: string[],
    ...handlers: Mdw<TReq, TRes>[]
  ): void {
    handlers.unshift(this.mdw_CheckRole(roles));
    super.endpoint(apiRoute, verb, ...handlers);
  }

  /**
   * Specifies a route at which to listen for POST login requests and a function
   * to dictate behaviour. For valid login attempts, return a payload object -
   * in accordance with the user. Subject (sub) and roles (rol) are suggested.
   * For invalid attempts, a null payload must be returned.
   */
  authenticate<TReq, TRes>(
    apiRoute: string,
    payloadFn: (req: TReq) => JwtToken,
    mdwPre?: Mdw<TReq, TRes>[],
    mdwPost?: Mdw<TReq, TRes>[]
  ): void {
    const handlers = [this.mdw_IssueToken(payloadFn)];
    if (mdwPre) handlers.unshift(...mdwPre);
    if (mdwPost) handlers.push(...mdwPost);

    this.endpoint(apiRoute, 'post', ...handlers);
  }

  private mdw_IssueToken<TReq>(fn: (req: TReq) => JwtToken): Mdw<TReq, any> {
    return (sub) => {
      const payload = fn(sub.data);
      if (!payload) throw new PipelineError(401, 'User not recognised');
      return { token: this.jwtIssuer.issue(payload) };
    };
  }

  private mdw_CheckRole<TReq>(roles: string[]): Mdw<TReq, any> {
    const tokenRegex = /^[Bb]earer ([\w-]*\.[\w-]*\.[\w-]*)$/;
    return (sub) => {
      const authz = sub.requestHeaders['authorization'] as string;
      const token = ((authz || '').match(tokenRegex) || [])[1] || '';
      const jwt = this.jwtIssuer.parseValid(token);
      if (!jwt) throw new PipelineError(401, 'User not recognised');
      if (roles.length && !(jwt.rol ?? []).some((r) => roles.includes(r))) {
        throw new PipelineError(403, 'User not authorized');
      }
    };
  }
}
