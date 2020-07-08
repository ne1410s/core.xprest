/** Standard set of JWT properties. */
export interface JwtToken {
  /** The token issuer. */
  iss?: string;

  /** The subject (e.g. user name or identifier). */
  sub?: string;

  /** The audience (e.g. granted system / module / api names). */
  aud?: string[];

  /** The roles (e.g. logical partitioning of duties). */
  rol?: string[];

  /** The end of the expiry window (epoch seconds). */
  exp?: number;

  /** The start of the expiry window (epoch seconds). */
  nbf?: number;

  /** When the token was issued (epoch seconds). */
  iat?: number;
}
