import { Platform } from "react-native";

export const API_CONFIG = {
  JAVA_API_BASE_URL: "https://mottu-java-api.onrender.com/api",
  PYTHON_API_BASE_URL: "https://mottu-python-api.onrender.com",
  JAVA_API_LOCAL: "http://10.0.2.2:8080/api",
  PYTHON_API_LOCAL: "http://10.0.2.2:8000",
};

const USE_LOCAL_PYTHON_API = false;
const MEU_IPV4 = "26.175.45.105";

export const getJavaApiUrl = () => {
  return API_CONFIG.JAVA_API_BASE_URL;
};

export const getPythonApiUrl = () => {
  if (USE_LOCAL_PYTHON_API) {
    if (Platform.OS === "android") {
      if (MEU_IPV4 && MEU_IPV4.trim() !== "") {
        return `http://${MEU_IPV4.trim()}:8000`;
      }
      return API_CONFIG.PYTHON_API_LOCAL;
    } else {
      if (MEU_IPV4 && MEU_IPV4.trim() !== "") {
        return `http://${MEU_IPV4.trim()}:8000`;
      }
      return "http://localhost:8000";
    }
  }
  return API_CONFIG.PYTHON_API_BASE_URL;
};
