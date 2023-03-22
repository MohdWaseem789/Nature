import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { forgotPassword } from './forgotPassword';
import { resetpassword } from './resetpassword';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const loginBtn = document.querySelector('.btn--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('.signup-form');
const forgotPasswordFrom = document.querySelector('.form--forgotpassword');
const resetPasswordForm = document.querySelector('.form--resetpassword');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// SIGNUP NEWUSER USING AXION(API) //////////////////////////////////////////////////////////////////////

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Change button text while Signing up a new user
    document.querySelector('.btn--signup').innerText = 'Signing...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordconfirm').value;
    await signup(name, email, password, passwordConfirm);

    // Change button text and clear input-fields after Signing up new user
    document.querySelector('.btn--signup').innerText = 'Signup';
    signupForm.reset();
  });
}

// LOGIN USING AXION(API) //////////////////////////////////////////////////////////////////////////////////////
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Change button text while login
    document.querySelector('.btn--login').innerText = 'Logging...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);

    // Change button text after login
    document.querySelector('.btn--login').innerText = 'Login';
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });

// UPDATE USER PASSWORD USING AXION(API) ////////////////////////////////////////////////////////////////////////
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Change button text while updating password
    document.querySelector('.btn--save--password').innerText = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    // Change button text and clear input-fields after changing password
    document.querySelector('.btn--save--password').innerText = 'Save password';
    userPasswordForm.reset();
  });
}
// FORGOT PASSWORD
if (forgotPasswordFrom) {
  forgotPasswordFrom.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Change button text while sending email
    document.querySelector('.btn-forgot-password').innerText = 'Sending...';

    const email = document.getElementById('emailForgotPassword').value;
    await forgotPassword(email);

    // Change button text after sending email
    document.querySelector('.btn-forgot-password').innerText = 'Submit';
  });
}

// RESET PASSWORD
if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Change button text while resetting password
    document.querySelector('.btn--reset').innerText = 'Resetting...';

    const password = document.getElementById('passwordResetPassword').value;
    const passwordConfirm = document.getElementById(
      'passwordConfirmResetPassword'
    ).value;
    const resetToken = document.getElementById('resetToken').value;

    await resetpassword(password, passwordConfirm, resetToken);

    // Change button text after resetting password
    document.querySelector('.btn--reset').innerText = 'Reset';
  });
}

// BOOKING PAYMENT BUTTON
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.innerText = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
