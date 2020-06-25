const expect = require('chai').expect;
const ne_xprest = require('../dist/ne14_xprest.cjs.min');

describe('JwtIssuer', () => {
  it('should issue a token', () => {
    const jwtIssuer = new ne_xprest.JwtIssuer('th3_b0$$', 'a47c42ec74d2d008');
    const jwt = jwtIssuer.issue({ sub: 'user42' });
    expect(jwt).to.not.be.null;
    expect(jwt.length).to.be.greaterThan(10);
  });

  it('should (privately) parse a valid token', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const jwt = jwtIssuer.issue({ sub: 'user42' });
    const raw = jwtIssuer.parseRaw(jwt);
    expect(raw).to.not.be.null;
    expect(raw.iss).to.equal(issuer);
  });

  it('should (privately) parse a token outside of its validity period', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const jwt = jwtIssuer.issue({ sub: 'user42', nbf: new Date().getTime() / 1000 + 100, exp: 42 });
    const raw = jwtIssuer.parseRaw(jwt);
    expect(raw).to.not.be.null;
    expect(raw.iss).to.equal(issuer);
  });

  it('should (privately) parse a token despite it having a modified signature', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const jwt = jwtIssuer.issue({ sub: 'user42' }) + 'dsf23';
    const val = jwtIssuer.parseRaw(jwt);
    expect(val).to.not.be.null;
  });

  it('should not (privately) parse gibberish', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const val = jwtIssuer.parseRaw('woottoken');
    expect(val).to.be.null;
  });

  it('should not parse a token before nbf', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const jwt = jwtIssuer.issue({ sub: 'user42', nbf: new Date().getTime() / 1000 + 100 });
    const val = jwtIssuer.parseValid(jwt);
    expect(val).to.be.null;
  });

  it('should not parse a token after exp', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const jwt = jwtIssuer.issue({ sub: 'user42', exp: new Date().getTime() / 1000 - 100 });
    const val = jwtIssuer.parseValid(jwt);
    expect(val).to.be.null;
  });

  it('should not parse a token with a modified signature', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const jwt = jwtIssuer.issue({ sub: 'user42' }) + 'dsf23';
    const val = jwtIssuer.parseValid(jwt);
    expect(val).to.be.null;
  });

  it('should not parse gibberish', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const val = jwtIssuer.parseValid('woottoken');
    expect(val).to.be.null;
  });

  it('should parse a valid token', () => {
    const issuer = 'th3_b0$$';
    const jwtIssuer = new ne_xprest.JwtIssuer(issuer, 'a47c42ec74d2d008');
    const jwt = jwtIssuer.issue({ sub: 'user42' });
    const val = jwtIssuer.parseValid(jwt);
    expect(val).to.not.be.null;
  });
});
