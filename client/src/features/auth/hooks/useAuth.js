import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginStart, loginSuccess, loginFailure } from "../state/authSlice.js";
import { loginUserAPI, registerUserAPI } from "../api/auth.api.js"; // Import register API

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error: serverError } = useSelector((state) => state.auth);
  const [validationError, setValidationError] = useState("");

  const clearErrors = () => {
    if (validationError) setValidationError("");
  };

  // --- LOGIN LOGIC ---
const login = async (formData) => {
  if (!formData.email || !formData.password) {
    setValidationError("All fields are strictly required.");
    return false;
  }

  const payload = {
    ...formData,
    email: formData.email.toLowerCase().trim(),
  };

  try {
    dispatch(loginStart());
    const data = await loginUserAPI(payload);
    dispatch(loginSuccess(data));
    navigate("/dashboard");
    return true;
  } catch (err) {
    const errMsg =
      err.response?.data?.message ||
      "Authentication connection failed.";

    dispatch(loginFailure(errMsg));
    return false;
  }
};

// --- SIGNUP LOGIC ---
const register = async (formData) => {
  if (!formData.name || !formData.email || !formData.password) {
    setValidationError(
      "Name, email, and password are strictly required."
    );
    return false;
  }

  const payload = {
    ...formData,
    email: formData.email.toLowerCase().trim(),
  };

  try {
    dispatch(loginStart());
    const data = await registerUserAPI(payload);
    dispatch(loginSuccess(data));
    navigate("/dashboard");
    return true;
  } catch (err) {
    console.log(err);

    const errMsg =
      err.response?.data?.message ||
      "Registration connection failed.";

    dispatch(loginFailure(errMsg));
    return false;
  }
};

  return { 
    login, 
    register, // Expose the new method to your UI
    isLoading, 
    serverError, 
    validationError, 
    clearErrors 
  };
};