import validator from "validator";

export function onlyText(data, allowSpace) {
  if (allowSpace) return data?.replace(/[^a-zA-Z ]/g, "") || "";
  return data?.replace(/[^a-zA-Z]/g, "") || "";
}

export function vaildatePhone(data) {
  return validator.isMobilePhone(data, "en-IN");
}

export function vaildateEmail(data) {
  return validator.isEmail(data);
}

export function validUsername (val) {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(val);
};

export function onlyNum(data) {
  return !isNaN(data);
}

export function removenonnumber(data) {
  return data.replace(/[^0-9.]/g, "");
}

export function validatePassword(pass) {
  if (!checkLength(pass)) {
    return false;
  }
  if (!checkLower(pass)) {
    return false;
  }
  if (!checkUpper(pass)) {
    return false;
  }
  if (!checkSpecial(pass)) {
    return false;
  }
  if (!checkNumber(pass)) {
    return false;
  }
  return true;
}
function checkLength(pass) {
  return pass.length >= 8;
}
function checkLower(pass) {
  return !(pass.search(/[a-z]/) < 0);
}
function checkUpper(pass) {
  // password.search(/.*[A-Z].*/) > 0)
  return !(pass.search(/[A-Z]/) < 0);
}
function checkNumber(pass) {
  return !(pass.search(/[0-9]/) < 0);
}
function checkSpecial(pass) {
  return !(pass.search(/[!@#$%^&*]/) < 0);
}
