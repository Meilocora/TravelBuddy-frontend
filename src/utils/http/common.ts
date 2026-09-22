import axios, { AxiosResponse } from 'axios';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/auth`;

export function handleBackendRequestError<
  T extends { status: number; error?: string },
>(error: unknown, fallbackErrorMessage: string): T {
  if (
    axios.isAxiosError(error) &&
    error.response?.status.toString()[0] === '4'
  ) {
    const responseData = error.response.data;
    // Handle 4XX Bad Request errors specifically
    // Error 400 = validation failed on the backend and the response contains details about the validation errors
    if (responseData && typeof responseData === 'object') {
      return {
        ...(responseData as Record<string, unknown>),
        status: error.response.status,
      } as T;
    }

    return {
      status: error.response.status,
      error: fallbackErrorMessage,
    } as T;
  }

  return {
    status: 500,
    error: fallbackErrorMessage,
  } as T;
}

interface RefreshTokenProps {
  token?: string;
  newToken?: string;
  refreshToken?: string;
  newRefreshToken?: string;
  error?: string;
  status: number;
}

export const refreshAuthToken = async (
  refreshToken: string,
): Promise<RefreshTokenProps> => {
  try {
    const response: AxiosResponse<RefreshTokenProps> = await axios.post(
      `${prefix}/refresh-token`,
      { refreshToken },
    );

    return {
      newToken: response.data.newToken,
      newRefreshToken: response.data.newRefreshToken,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<RefreshTokenProps>(
      error,
      'Could not refresh token! Backend request failed.',
    );
  }
};
