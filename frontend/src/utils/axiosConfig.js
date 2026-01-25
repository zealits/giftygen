import axios from "axios";

// Configure axios to send cookies with all requests
// This is necessary for httpOnly cookies to work
axios.defaults.withCredentials = true;

export default axios;
