import React from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";

interface GuestRouteProps {
  children: React.ReactNode;
  path: string;
}
const GuestRoute = ({ children, ...rest }: GuestRouteProps): JSX.Element => {
  return (
    <Route
      {...rest}
      render={({ location }): JSX.Element | React.ReactNode =>
        !Cookies.get("email") ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/dashboard",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default GuestRoute;
