import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    isLoggedIn: !!localStorage.getItem("token"),
  });

  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    setAuth({ token, role, isLoggedIn: true });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null, isLoggedIn: false });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
