import axios from "axios";

const Servers = {
  LiveServer: "https://api.upsurgefi.com/",
  TestServer: "http://localhost:4000/",
};

const BaseUrl = Servers.TestServer;

const getHeader = async (formData, token) => {
  return {
    Accept: formData ? "multipart/form-data" : "application/json",
    "Content-Type": formData ? "multipart/form-data" : "application/json",
    token: token || "",
  };
};

const getUpdatedHeader = async (formData) => {
  return {
    Accept: formData
      ? "multipart/form-data"
      : "application/x-www-form-urlencoded; charset=UTF-8",
    "Content-Type": formData
      ? "multipart/form-data"
      : "application/x-www-form-urlencoded; charset=UTF-8",
  };
};

export const getResponse = async (url, params, token) => {
  const URL = BaseUrl + url;
  return axios(URL, {
    params,
    method: "GET",
    headers: await getHeader(false, token),
  })
    .then((response) => response)
    .catch((error) => {
      if (
        error.response &&
        error.response.status === 403 &&
        !error.response.success
      ) {
        ///     logout()
        window.location.href = "/";
      } else return error;
    });
};

export const putResponse = async (url, payload, token) => {
  const URL = BaseUrl + url;
  return axios(URL, {
    method: "PUT",
    headers: await getHeader(false, token),
    data: payload,
  })
    .then((response) => response)
    .catch((error) => {
      console.log(error);
      if (error?.response?.status === 403 && !error.response.success) {
        ///     logout()
        window.location.href = "/";
      } else return error;
    });
};

export const deleteResponse = async (url, params, token) => {
  const URL = BaseUrl + url;
  return axios(URL, {
    params,
    method: "DELETE",
    headers: await getHeader(false, token),
  })
    .then((response) => response)
    .catch((error) => {
      if (error.response.status === 403 && !error.response.success) {
        //    logout()
        window.location.href = "/";
      } else return error;
    });
};

export const postResponse = async (url, payload, token) => {
  const URL = BaseUrl + url;
  return axios(URL, {
    method: "POST",
    headers: await getHeader(false, token),
    data: payload,
  })
    .then((response) => response)
    .catch((error) => {
      console.log(error);
      /*if (error.response.status === 403 && !error.response.success) {
      //      logout()
            window.location.href = '/'
        } else return error*/
    });
};

export const postResponseUpdated = async (url, payload) => {
  const URL = BaseUrl + url;
  return axios(URL, {
    method: "POST",
    headers: await getUpdatedHeader(),
    data: payload,
  })
    .then((response) => response)
    .catch((error) => {
      console.log(error);

      /*if (error.response.status === 403 && !error.response.success) {
         ///   logout()
            window.location.href = '/'
        } else return error*/
    });
};

export const postResponseFormData = async (url, payload) => {
  const URL = BaseUrl + url;
  return axios
    .post(URL, payload, { headers: await getHeader(true) })
    .then((response) => response)
    .catch((error) => {
      /*if (error.response.status === 403 && !error.response.success) {
   //         logout()
            window.location.href = '/'
        } else return error*/
      console.log(error);
    });
};
