import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="115301406415-k3g2dcn65n6kt5t251f7bmlo2sgs9vd6.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
