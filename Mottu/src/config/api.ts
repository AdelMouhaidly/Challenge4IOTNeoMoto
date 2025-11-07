// Configuração das URLs das APIs
export const API_CONFIG = {
  // API Java (Spring Boot) - Render
  JAVA_API_BASE_URL: "https://mottu-java-api.onrender.com/api",
  
  // API Python (FastAPI) - Render
  PYTHON_API_BASE_URL: "https://mottu-python-api.onrender.com",
  
  // URLs locais para desenvolvimento (fallback)
  JAVA_API_LOCAL: "http://10.0.2.2:8080/api",
  PYTHON_API_LOCAL: "http://10.0.2.2:8000",
};

// Função para obter URL da API Java
export const getJavaApiUrl = () => {
  // Em produção, usa Render. Em desenvolvimento, pode usar local
  return API_CONFIG.JAVA_API_BASE_URL;
};

// Função para obter URL da API Python
export const getPythonApiUrl = () => {
  // Em produção, usa Render. Em desenvolvimento, pode usar local
  return API_CONFIG.PYTHON_API_BASE_URL;
};

