/**
 * Mock Data Utilities (Disabled)
 * 
 * This file provides stub implementations for backward compatibility.
 * Mock mode has been disabled in the application.
 */

// These functions now return false or do nothing since mock mode is disabled
export const isMockDataModeEnabled = () => false;
export const toggleMockDataMode = () => false;
export const enableMockDataMode = () => {};
export const disableMockDataMode = () => {};

// Returns empty mock data - should not be used
export const getMockUserProfile = () => ({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  address: '',
  role: '',
  profileImage: ''
});

export default {
  isMockDataModeEnabled,
  toggleMockDataMode,
  enableMockDataMode,
  disableMockDataMode,
  getMockUserProfile
}; 