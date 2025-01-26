import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginPage from "../../app/Login";

import SignUpPage from "../../app/signup";

const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginPage} />
      <AuthStack.Screen name="SignUp" component={SignUpPage} />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;