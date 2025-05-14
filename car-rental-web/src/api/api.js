import axios from 'axios';

// Tạo instance axios với các cấu hình mặc định
const api = axios.create({
  baseURL: 'http://Car-rental-backend1-env-1.eba-gs2svizp.us-east-1.elasticbeanstalk.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Hàm lấy danh sách xe
export const getCars = async () => {
  try {
    const response = await api.get('/cars');
    return response.data;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

// Thêm các hàm API khác ở đây
export const getCarById = async (id) => {
  try {
    const response = await api.get(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching car with id ${id}:`, error);
    throw error;
  }
};

export const getFilteredCars = async ({ search = '', brand = [], type = [] }) => {
  try {
    const queryParams = new URLSearchParams();

    if (search) queryParams.append('search', search);
    if (brand.length > 0 && !brand.includes('All')) queryParams.append('brand', brand.join(','));
    if (type.length > 0 && !type.includes('All')) queryParams.append('type', type.join(','));

    const response = await api.get(`/cars?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching filtered cars:", error);
    throw error;
  }
};

export const getSuggestions = async (searchText) => {
  try {
    const response = await api.get(`/cars?search=${encodeURIComponent(searchText)}`);
    console.log("Suggestions API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export default api;