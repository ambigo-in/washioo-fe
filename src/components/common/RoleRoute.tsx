import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RoleRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) => {
  const { user } = useAuth();

  const userRoles = user?.roles || [];

  const hasAccess = userRoles.some((role: string) =>
    allowedRoles.includes(role),
  );

  if (!hasAccess) return <Navigate to="/unauthorized" />;

  return children;
};

export default RoleRoute;
