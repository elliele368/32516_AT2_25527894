import api from './api';

export const getSuggestions = async (query) => {
  try {
    const response = await api.get(`/car/suggestions?search=${encodeURIComponent(query)}`);
    return response.data; // Return the entire response.data
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return { data: [] }; // Return an empty data array on error
  }
};