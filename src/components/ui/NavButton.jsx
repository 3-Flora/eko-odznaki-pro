import { useNavigate } from "react-router";
import Button from "./Button";

export default function NavButton({ href, ...props }) {
  const navigate = useNavigate();

  return <Button onClick={() => navigate(href)} {...props} />;
}
