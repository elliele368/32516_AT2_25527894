/**
 * Client Database
 * 
 * Handles client-side reservation state using localStorage
 * - Each client can only reserve one car at a time
 * - State persists across page reloads
 * - No state sharing between sessions
 */
class ClientDatabase {
  /**
   * Initialize with a namespace to avoid localStorage conflicts
   */
  constructor(namespace = 'elcar-rental') {
    this.namespace = namespace;
    this.clientId = this._generateClientId();
  }

  /**
   * Generate a unique client ID for this session
   */
  _generateClientId() {
    let clientId = localStorage.getItem(`${this.namespace}_clientId`);
    if (!clientId) {
      clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2);
      localStorage.setItem(`${this.namespace}_clientId`, clientId);
    }
    return clientId;
  }

  /**
   * Get client ID
   * @returns {string} Client ID
   */
  getClientId() {
    return this.clientId;
  }

  /**
   * Store a value in localStorage with client-specific namespace
   * @param {string} key - Key to store value under
   * @param {any} value - Value to store
   */
  set(key, value) {
    localStorage.setItem(`${this.namespace}_${this.clientId}_${key}`, JSON.stringify(value));
  }

  /**
   * Get a value from localStorage with client-specific namespace
   * @param {string} key - Key to retrieve value from
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Retrieved value or defaultValue
   */
  get(key, defaultValue = null) {
    const value = localStorage.getItem(`${this.namespace}_${this.clientId}_${key}`);
    return value !== null ? JSON.parse(value) : defaultValue;
  }

  /**
   * Remove a value from localStorage with client-specific namespace
   * @param {string} key - Key to remove
   */
  remove(key) {
    localStorage.removeItem(`${this.namespace}_${this.clientId}_${key}`);
  }

  /**
   * Save reserved car VIN
   * @param {string} vin - Car VIN to reserve
   * @returns {string|null} Previously reserved VIN if any
   */
  reserveCar(vin) {
    const previousVin = this.getReservedCar();
    localStorage.setItem(`${this.namespace}_${this.clientId}_reservedCar`, vin);
    return previousVin;
  }

  /**
   * Get currently reserved car VIN
   * @returns {string|null} Reserved car VIN or null
   */
  getReservedCar() {
    return localStorage.getItem(`${this.namespace}_${this.clientId}_reservedCar`) || null;
  }

  /**
   * Cancel current car reservation
   * @returns {string|null} Previously reserved VIN or null
   */
  cancelReservation() {
    const previousVin = this.getReservedCar();
    localStorage.removeItem(`${this.namespace}_${this.clientId}_reservedCar`);
    return previousVin;
  }

  /**
   * Check if a specific car is reserved by this client
   * @param {string} vin - Car VIN to check
   * @returns {boolean} True if this car is reserved by this client
   */
  isCarReservedByClient(vin) {
    return this.getReservedCar() === vin;
  }

  /**
   * Save form data for reservation
   * @param {object} formData - Form data to save
   */
  saveFormData(formData) {
    this.set('formData', formData);
  }

  /**
   * Get saved form data
   * @returns {object|null} Saved form data or null
   */
  getFormData() {
    return this.get('formData');
  }

  /**
   * Clear form data
   */
  clearFormData() {
    this.remove('formData');
  }
}

// Export a singleton instance
const clientDB = new ClientDatabase();
export default clientDB;