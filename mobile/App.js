import { View, Text, Dimensions, StyleSheet, Button, Image, DeviceEventEmitter, Buttontter } from 'react-native';
import axios from 'axios'; //ส่ง HTTP requests (เช่น GET, POST) ไปยัง backend หรือ API (เช่นดึงข้อมูลจากเซิร์ฟเวอร์)
import "./global.css"
// import { Calendar } from 'react-native-calendars';
import 'react-native-gesture-handler';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import HomeScreen from './HomeScreen';
import ListTaskScreen from './ListTaskScreen';
import AddTaskScreen from './AddTaskScreen';
import AllTasksScreen from './AllTasksScreen';
import { AppContext } from './AppContext';

///
// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
///


// import dayjs from 'dayjs';
// import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



const BASE_URL = 'http://192.168.43.9:5000'; // เปลี่ยน IP ให้ตรงกับคอม

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Calendar" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AllTasksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="All Tasks" component={AllTasksScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
function ListTaskStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="List-Task" component={ListTaskScreen}
      // options={({ navigation }) => ({
      //   headerShown: true,  // เปิด header
      //   title: 'All Tasks',
      //   headerLeft: () => (
      //     <Button
      //       title="Back"
      //       onPress={() => {
      //         setShowListTask(false),
      //           navigation.navigate('List-Task')
      //       }}
      //     />
      //   ),
      // })}
      />

    </Stack.Navigator>
  );
}

function AddStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Add Task" component={AddTaskScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {

  const [markedDates, setMarkedDates] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allFavTasks, setAllFavTasks] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [isShowFav, setShowFav] = useState(false);
  const [isShowAllList, setShowAllList] = useState(false);
  const [isShowHome, setShowHome] = useState(false);
  const [isShowAdd, setShowAdd] = useState(false);
  const [isShowListTask, setShowListTask] = useState(false);
  const [isLiked, setIsLiked] = useState(false);



  const [selectedDate, setDate] = useState(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

  const { width, height } = Dimensions.get('window');
  const dayWidth = width / 7;



  const contextValue = {
    ShowFav,
    handleShowAllTasks: () => { },
    markedDates,
    setMarkedDates,
    isShowFav,
    isLiked,
    setIsLiked,
    setShowFav,
    isShowAllList,
    isShowListTask,
    setShowListTask,
    allTasks,
    allFavTasks,
    tasks,
    setTasks,
    selectedDate,
    setDate,

    selectedTaskIndex,
    setSelectedTaskIndex,
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('reloadAllTasks', handleShowAllTasks);
    return () => {
      subscription.remove(); // cleanup เวลา component ถูก destroy
    };
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('reloadAllFavTasks', ShowFav);
    console.log('call reloadfav');

    // โหลดตอน mount ครั้งแรก
    //loadFavTasks();

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const loadMarkedDates = async () => {
      try {
        const jsonDatesMap = await AsyncStorage.getItem('taskDatesMap');
        const datesMap = jsonDatesMap ? JSON.parse(jsonDatesMap) : {};

        const updatedMarks = {};
        const colors = ['pink', 'orange', 'red', 'green', 'purple'];

        for (const date in datesMap) {
          // เช็คว่ามี task จริงในวันนั้นไหม
          const tasksJson = await AsyncStorage.getItem(`tasks-${date}`);
          const tasks = tasksJson ? JSON.parse(tasksJson) : [];

          if (tasks.length > 0) {
            updatedMarks[date] = {
              marked: true,
              dotColor: datesMap[date],
            };
          } else {
            // ถ้าไม่มี task แล้ว ให้ลบวันนั้นออกจาก map
            delete datesMap[date];
          }
        }

        // Save updated taskDatesMap
        await AsyncStorage.setItem('taskDatesMap', JSON.stringify(datesMap));
        setMarkedDates(updatedMarks);
      } catch (e) {
        console.log('Error loading marked dates:', e);
      }
    };

    // const unsubscribe = navigation.addListener('focus', loadMarkedDates);
    // return unsubscribe;
    loadMarkedDates();
  }, []);

  const handleShowAllTasks = async () => {
    try {
      const savedAll = await AsyncStorage.getItem('allTasks');
      const allTasks = savedAll ? JSON.parse(savedAll) : [];

      // จัดกลุ่ม tasks ตามวันที่
      const groupedTasks = allTasks.reduce((acc, task) => {
        if (!acc[task.date]) {
          acc[task.date] = [];
        }
        acc[task.date].push(task);
        return acc;
      }, {});

      // แปลง groupedTasks เป็น array สำหรับ map แสดงผล
      const allTasksList = Object.keys(groupedTasks)
        .sort((a, b) => dayjs(a).unix() - dayjs(b).unix()) // เรียงวันที่ (ถ้าต้องการ)
        .map(date => ({
          date,
          tasks: groupedTasks[date].sort((a, b) => a.time.localeCompare(b.time))
        }));

      setAllTasks(allTasksList);
      // console.log('all Task after add= ', allTasks);


      setShowAllList(true);
      setShowFav(false);
      setShowAdd(false);
      setShowHome(false);
      
      navigation.navigate('AllTasks', {
        isShowAllList: true,
        allTasks: allTasks,
      });

      console.log('go to alltasksscreen');
    } catch (e) {
      console.log('Error loading all tasks:', e);
    }
  };

  const ShowFav = async () => {
    // await AsyncStorage.removeItem('allTasks');
    // console.log('✅ ล้าง allTasks แล้ว');
    try {
      const savedFav = await AsyncStorage.getItem('allFavTask');
      const favTasks = savedFav ? JSON.parse(savedFav) : [];

      // จัดกลุ่ม tasks ตามวันที่พำ
      const groupedFavTasks = favTasks.reduce((acc, task) => {
        if (!acc[task.date]) {
          acc[task.date] = [];
        }
        acc[task.date].push(task);
        return acc;
      }, {});

      const favTasksList = Object.keys(groupedFavTasks)
        .sort((a, b) => dayjs(a).unix() - dayjs(b).unix())
        .map(date => ({
          date,
          tasks: groupedFavTasks[date].sort((a, b) => a.time.localeCompare(b.time))
        }));

      setAllFavTasks(favTasksList);

      setShowFav(true);
      setShowAllList(false);
      setShowAdd(false);
      setShowHome(false);

      // console.log('📦 allFavTask:', favTasks);
    } catch (e) {
      console.log('Error loading favorite tasks:', e);
    }
  };

  const ShowHome = async () => {

    setShowFav(false);
    setShowAllList(false);
    setShowAdd(false);
    setShowHome(true);

  }

  const ShowAdd = async () => {
    setShowFav(false);
    setShowAllList(false);
    setShowAdd(true);
    setShowHome(false);
  }

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              height: 70,
              paddingBottom: 15,
              backgroundColor: 'white',
              borderTopWidth: 0.15,
            },
            tabBarIcon: ({ focused }) => {
              let iconSource;

              if (route.name === 'Home') {
                iconSource = focused
                  ? require('./Image/afterhome.png')
                  : require('./Image/beforehome.png');
              } else if (route.name === 'AllTasks') {
                iconSource = focused
                  ? require('./Image/afterlist.png')
                  : require('./Image/beforelist.png');
              } else if (route.name === 'Add') {
                iconSource = focused
                  ? require('./Image/afteradd.png')
                  : require('./Image/beforeadd.png');
              }
              else if (route.name === 'ListTask') {
                iconSource = focused
                  ? require('./Image/afterlist.png')
                  : require('./Image/beforelist.png');
              }


              return <Image source={iconSource} style={{ width: 30, height: 30 }} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen
            name="AllTasks"
            component={AllTasksStack}
            listeners={{
              tabPress: (e) => {
                // เรียกฟังก์ชันเมื่อมีการกด tab
                handleShowAllTasks();
              },
            }}
          />
          <Tab.Screen name="Add" component={AddStack} />
          <Tab.Screen name="ListTask" component={ListTaskScreen} />
          {/* <Tab.Screen name="List-Task" component={ListTaskStack} /> */}


        </Tab.Navigator>



      </NavigationContainer>
    </AppContext.Provider>




  );

}
