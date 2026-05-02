import { Link } from "react-router-dom";
import "./HomeLegalFooter.css";

export default function HomeLegalFooter() {
  return (
    <footer className="home-legal-footer">
      <span>© Washioo. All rights reserved.</span>
      <Link to="/terms-and-conditions">Terms and Conditions</Link>
    </footer>
  );
}
