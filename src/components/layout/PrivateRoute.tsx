import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import NavigationBar from "@components/NavigationBar";
import apiClient from "@apis/apiClient";

const PrivateRoute = () => {
  const isSignedIn = Boolean(sessionStorage.getItem("_ZA"));
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (userInfo == null) {
      apiClient
        .get("/users/me")
        .then((res) => {
          const userData = res?.data?.data;
          if (res.status === 200 && userData) {
            setUserInfo(userData);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [userInfo]);

  if (!isSignedIn) {
    localStorage.clear();
    return <Navigate to="/sign-in" />;
  }

  if (!userInfo) return <div>loading ...</div>;

  return (
    <>
      <NavigationBar userInfo={userInfo} />
      <div className="flex-1">
        <Outlet />
      </div>
    </>
  );
};

export default PrivateRoute;
