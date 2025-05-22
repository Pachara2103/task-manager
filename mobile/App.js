import React from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios'; //ส่ง HTTP requests (เช่น GET, POST) ไปยัง backend หรือ API (เช่นดึงข้อมูลจากเซิร์ฟเวอร์)
import "./global.css"
// import { Calendar } from 'react-native-calendars';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import ListTaskScreen from './ListTaskScreen';
import AddTaskScreen from './AddTaskScreen';
import { useNavigationState } from '@react-navigation/native';


// import dayjs from 'dayjs';
// import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();


const BASE_URL = 'http://192.168.43.9:5000'; // เปลี่ยน IP ให้ตรงกับคอม

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Calendar">
        <Stack.Screen name="Calendar" component={HomeScreen} />
        <Stack.Screen name="List-Task" component={ListTaskScreen}/>
        <Stack.Screen name="Add Task" component={AddTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
