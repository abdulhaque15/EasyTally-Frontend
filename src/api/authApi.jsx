import api from '../config/axios-config';

const signupUser = async (data) => {
  try {
    const response = await api.post('/user/create', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during create user' };
  }
};

const loginUser = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    throw error;
  };
};

const sendResetEmail = async (email) => {
  try {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send reset email' };
  }
};

const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'OTP verification failed' };
  }
};

const resetPassword = async ({ email, password }) => {
  try {
    const response = await api.post('/auth/reset-password', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password reset failed' };
  }
};

export {
  loginUser,
  signupUser,
  sendResetEmail,
  verifyOtp,
  resetPassword
};
