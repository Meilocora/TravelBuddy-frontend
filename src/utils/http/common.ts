import axios, { AxiosResponse } from 'axios';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/auth`;

interface RefreshTokenProps {
  token?: string;
  newToken?: string;
  refreshToken?: string;
  newRefreshToken?: string;
  error?: string;
  status: number;
}

export const refreshAuthToken = async (
  refreshToken: string
): Promise<RefreshTokenProps> => {
  try {
    const response: AxiosResponse<RefreshTokenProps> = await axios.post(
      `${prefix}/refresh-token`,
      { refreshToken }
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return {
      newToken: response.data.newToken,
      newRefreshToken: response.data.newRefreshToken,
      status: response.data.status,
    };
  } catch (error) {
    return { status: 500, error: 'Could not refresh token!' };
  }
};
