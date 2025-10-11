declare module 'node-quickbooks' {
  class QuickBooks {
    constructor(
      consumerKey: string | undefined,
      consumerSecret: string | undefined,
      oauthToken: string,
      oauthTokenSecret: boolean | string,
      realmId: string,
      useSandbox: string | boolean
    );

    token: string;
    refreshToken: string;
    realmId: string;

    static scopes: {
      Accounting: string;
      OpenId: string;
    };

    getAuthorizeUri(scopes: string[]): string;
    findInvoices(callback: (err: any, invoices: any) => void): void;
  }

  export = QuickBooks;
}
