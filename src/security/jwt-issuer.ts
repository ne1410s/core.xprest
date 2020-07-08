import * as jws from 'jws';
import { JwtToken } from './jwt-token';

/** A host for issuing json web tokens. */
export class JwtIssuer {
  /** Initialises a new instance of the @see JwtIssuer class. */
  constructor(private issuer: string, private secret: string, private minutes: number = 15) {}

  /** Issues a token containing the supplied payload. */
  public issue<T extends JwtToken>(payload: T): string {
    this.preparePayload(payload);
    return jws.sign({
      header: { alg: 'HS256' },
      payload,
      secret: this.secret,
    });
  }

  /** Parses the contents of a (valid) token. */
  public parseValid<T extends JwtToken>(token: string): T {
    const now = new Date().getTime() / 1000;
    const payload = this.parseRaw<T>(token);
    return payload &&
      (!payload.exp || now < payload.exp) &&
      (!payload.nbf || now >= payload.nbf) &&
      jws.verify(token, 'HS256', this.secret)
      ? payload
      : null;
  }

  /** Parses the contents of a token. */
  private parseRaw<T extends JwtToken>(token: string): T {
    const decoded = jws.decode(token);
    return decoded ? JSON.parse(decoded.payload) : null;
  }

  /** Prepares payload according to current time and instance config. */
  private preparePayload<T extends JwtToken>(payload: T): void {
    payload.iss = this.issuer;
    const date = new Date();
    payload.iat = date.getTime() / 1000;
    payload.nbf = payload.nbf || payload.iat;
    if (!payload.exp) {
      date.setMinutes(date.getMinutes() + this.minutes);
      payload.exp = date.getTime() / 1000;
    }
  }
}
