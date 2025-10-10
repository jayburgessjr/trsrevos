import QuickBooks from 'node-quickbooks';

const qbo = new QuickBooks(
  process.env.QUICKBOOKS_CLIENT_ID,
  process.env.QUICKBOOKS_CLIENT_SECRET,
  'your-company-id', // This will be set after the OAuth flow
  false, // no token
  'https://sandbox-quickbooks.api.intuit.com', // base_url
  'your-refresh-token' // This will be set after the OAuth flow
);

export const connect = async () => {
  const authUri = qbo.getAuthorizeUri([
    QuickBooks.scopes.Accounting,
    QuickBooks.scopes.OpenId,
  ]);

  // In a real application, you would redirect the user to this URL
  console.log('Please visit this URL to authorize the application:', authUri);
};

export const sync = async (accessToken: string, refreshToken: string, realmId: string) => {
  qbo.token = accessToken;
  qbo.refreshToken = refreshToken;
  qbo.realmId = realmId;

  qbo.findInvoices((err: any, invoices: any) => {
    if (err) {
      console.error(err);
    } else {
      console.log(invoices.QueryResponse.Invoice);
    }
  });
};

export const test = async () => {
  // In a real application, you would make a simple API call to test the connection
  console.log("Testing QuickBooks connection...");
};

export const disconnect = async () => {};