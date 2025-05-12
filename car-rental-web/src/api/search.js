import api from './api';

export const getSuggestions = async (query) => {
  try {
    console.log("Fetching suggestions for:", query);
    const response = await api.get(`/cars/suggestions?search=${encodeURIComponent(query)}`);
    return response.data; // Return the entire response.data
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return { data: [] }; // Return an empty data array on error
  }
};