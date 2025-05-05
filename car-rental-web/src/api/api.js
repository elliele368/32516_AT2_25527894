import axios from 'axios';

// Tạo instance axios với các cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:3002',
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

export default api;