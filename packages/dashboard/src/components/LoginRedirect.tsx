import { useNavigate } from "@solidjs/router";
import { createEffect } from "solid-js";

export const LoginRedirect = () => {
  const navigate = useNavigate();
    
  createEffect(() => {
    navigate("/login", { replace: true });
  });
  
  // Add a visible placeholder while redirecting
  return <div>Redirecting to login...</div>;
};
