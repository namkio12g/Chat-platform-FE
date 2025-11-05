// Example of how to use the new axios response structure
import axiosClient, { type ApiResponse } from './http';

// Example API call with the new response structure
export const exampleApiCall = async () => {
  try {
    const response = await axiosClient.get<
      ApiResponse<{ id: number; name: string }>
    >('/example');

    // Access the data
    console.log('Data:', response.data.data);
    console.log('Message:', response.data.message);

    return response.data.data;
  } catch (error: any) {
    // Handle errors
    console.error('Error message:', error.response?.data?.message);
    throw error;
  }
};

// Example of how your backend should return data:
/*
{
  "data": {
    "id": 1,
    "name": "John Doe"
  },
  "message": "User retrieved successfully"
}
*/
