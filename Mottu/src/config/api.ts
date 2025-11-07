export const API_CONFIG = {
  JAVA_API_BASE_URL: "https://mottu-java-api.onrender.com/api",
  PYTHON_API_BASE_URL: "https://mottu-python-api.onrender.com",
  JAVA_API_LOCAL: "http://10.0.2.2:8080/api",
  PYTHON_API_LOCAL: "http://10.0.2.2:8000",
};

export const getJavaApiUrl = () => {
  return API_CONFIG.JAVA_API_BASE_URL;
};

export const getPythonApiUrl = () => {
  return API_CONFIG.PYTHON_API_BASE_URL;
};

