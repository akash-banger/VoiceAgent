import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../constants";
import { useNavigate } from 'react-router-dom';


const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const createUser = async (name) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/users`, {
        username: name,
      });
      setLoading(false);

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.message + ", logging in..",
          position: "top-end",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });
        navigate('/agent/' + response.data.user_id);
        return response.data;
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      setLoading(false);

      if (err.response) {
        setError("Server error. Please try again later.");
      } else if (err.request) {
        setError(
          "No response from server. Please check your internet connection."
        );
      } else {

        setError("An error occurred while creating the user");
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "An error occurred while creating the user",
      });

      return null;
    }
  };

  return { createUser, loading, error };
};

export default useCreateUser;
