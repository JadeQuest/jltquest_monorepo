/**
 * Utility function to detect if an error is a user-initiated rejection in viem / wagmi / Web3 wallet prompts.
 */
export function isUserRejectedError(error: unknown): boolean {
  if (!error) return false;

  const err = error as {
    name?: string;
    code?: number;
    message?: string;
    cause?: { code?: number; name?: string; message?: string };
  };

  return (
    err.name === 'UserRejectedRequestError' ||
    err.code === 4001 ||
    err.cause?.code === 4001 ||
    err.cause?.name === 'UserRejectedRequestError' ||
    Boolean(err.message?.toLowerCase().includes('user rejected')) ||
    Boolean(err.message?.toLowerCase().includes('user denied')) ||
    Boolean(err.message?.toLowerCase().includes('rejected the request'))
  );
}
