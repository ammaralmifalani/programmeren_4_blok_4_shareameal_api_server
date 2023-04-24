// Validates the email using a regular expression
function validateEmail(email) {
  const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
}
// Validates the password using a regular expression
function validatePassword(password) {
  const regex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
  return regex.test(password);
}
// Validates the phone number using a regular expression
function validatePhoneNumber(phoneNumber) {
  const regex = /^\d{10}$/;
  return regex.test(phoneNumber);
}
// Exporting validation functions for email, password, and phone number
module.exports = {
  validateEmail: validateEmail,
  validatePassword: validatePassword,
  validatePhoneNumber: validatePhoneNumber,
};
