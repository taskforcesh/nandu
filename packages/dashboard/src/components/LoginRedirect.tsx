import { useNavigate } from "@solidjs/router";

export const LoginRedirect = () => {
  const navigate = useNavigate();
  navigate("/login");
  return <></>;
};
