import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth"; 
import { checkIfAdmin } from "../services/userService"; 
import { Home } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import "./styles/Header.css";

function Header() {
  const { isAuthenticated, userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchAdminStatus = async () => {
      if (userId) {
        const adminStatus = await checkIfAdmin(userId);
        setIsAdmin(adminStatus);
      }
    };

    fetchAdminStatus();
  }, [userId]);

  const isLoginPage = location.pathname === "/login";
  const shouldShowAuthButton = !isAuthenticated;

  return (
    <header className="header">
      <div className="header-container">
        <div className="title">
          <h1>Prüfungsvorbereitungs App</h1>
        </div>

        <NavigationMenu className="navigation">
          <NavigationMenuList>
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" className="navigation-link">
                  <Home className="icon" /> Willkommen
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/courses" className="navigation-link">
                  Kurse
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {isAuthenticated && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/profile" className="navigation-link">
                    Profil
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}

            {isAuthenticated && isAdmin && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/admin" className="navigation-link">
                    Admin
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {shouldShowAuthButton && (
          <div className="auth-button">
            <Link to={isLoginPage ? "/register" : "/login"}>
              <button className="button-auth">{isLoginPage ? "Registrieren" : "Anmelden"}</button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
