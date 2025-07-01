// helpers/logout.js

export const logOutUser = () => {
  window.localStorage.clear();
  window.location.href = "/landing-page";
};
