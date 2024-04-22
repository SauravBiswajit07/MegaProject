import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};

/* 
import axios from "axios";: This line imports the Axios library into the current file/module. Axios is a popular JavaScript library used for making HTTP requests from the browser or Node.js.

export const axiosInstance = axios.create({});: This line creates an Axios instance named axiosInstance using axios.create(). Creating an Axios instance allows you to set default configurations for requests, such as base URL or default headers. In this case, it's using the default configurations.

export const apiConnector = (method, url, bodyData, headers, params) => { ... };: This line defines a function named apiConnector that takes five parameters: method, url, bodyData, headers, and params. This function is designed to make HTTP requests using the Axios instance created earlier (axiosInstance).

Inside the apiConnector function:

return axiosInstance({ ... });: This line makes an HTTP request using the Axios instance (axiosInstance). It's using object destructuring to pass the request configuration as an object.
method: ${method}``: This sets the HTTP method for the request. The ${method} is a way to interpolate the method parameter passed to the apiConnector function.
url: ${url}``: This sets the URL for the request. Similar to the method, it interpolates the url parameter passed to the function.
data: bodyData ? bodyData : null: This sets the request body data. If bodyData is provided, it's used; otherwise, it's set to null.
headers: headers ? headers : null: This sets the request headers. If headers are provided, they're used; otherwise, it's set to null.
params: params ? params : null: This sets the query parameters for the request. If params are provided, they're used; otherwise, it's set to null.
Overall, this code allows you to easily make HTTP requests by calling the apiConnector function and passing in the necessary parameters such as method, URL, body data, headers, and query parameters. The Axios instance (axiosInstance) ensures that requests are made with the default configurations set earlier.
*/
 