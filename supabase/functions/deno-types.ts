export {};

type SupabaseServeHandler = (request: Request) => Response | Promise<Response>;

declare global {
  const Deno: {
    serve: (handler: SupabaseServeHandler) => void;
  };
}
