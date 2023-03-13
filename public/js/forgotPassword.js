import axios from 'axios';
import { showAlert } from './alert';

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/forgotpassword',
      data: {
        email: email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Please check your email');
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', 'Something went wrong');
  }
};
