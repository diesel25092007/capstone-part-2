import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import TabNavigator from "./TabNavigator";
import HomeScreen from "../screens/HomeScreen";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator screenOptions={{headerShown:false}}>
            <Drawer.Screen name="Home" component={TabNavigator} />
          
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;