import { Dimensions, Image, DeviceEventEmitter } from 'react-native';
import "./global.css"
import 'react-native-gesture-handler';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import HomeScreen from './HomeScreen';
import AddTaskScreen from './AddTaskScreen';
import AllTasksScreen from './AllTasksScreen';
import FavTaskScreen from './FavTaskScreen';

import { AppContext } from './AppContext';

///
// HomeScreen.js
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

///

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
function FavTaskStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Fav Task" component={FavTaskScreen} options={{ headerShown: false }} />
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
  console.log('-----------------------------------');
  // const isFocused = useIsFocused();
  // useEffect(() => {
  //   loadMarkedDates();

  // }, [isFocused]);

  // const loadMarkedDates = async () => {
  //   try {
  //     const jsonDatesMap = await AsyncStorage.getItem('taskDatesMap');
  //     const datesMap = jsonDatesMap ? JSON.parse(jsonDatesMap) : {};

  //     const updatedMarks = {};
  //     // const colors = ['pink', 'orange', 'red', 'green', 'purple'];

  //     for (const date in datesMap) {
  //       // เช็คว่ามี task จริงในวันนั้นไหม
  //       const tasksJson = await AsyncStorage.getItem(`tasks-${date}`);
  //       const tasks = tasksJson ? JSON.parse(tasksJson) : [];

  //       if (tasks.length > 0) {
  //         updatedMarks[date] = {
  //           marked: true,
  //           dotColor: datesMap[date],
  //         };
  //       } else {
  //         // ถ้าไม่มี task แล้ว ให้ลบวันนั้นออกจาก map
  //         delete datesMap[date];
  //       }
  //     }

  //     // Save updated taskDatesMap
  //     await AsyncStorage.setItem('taskDatesMap', JSON.stringify(datesMap));
  //     setMarkedDates(updatedMarks);
  //     console.log('loading mark dateeeeeeeeeeeeee');
  //   } catch (e) {
  //     console.log('Error loading marked dates:', e);
  //   }
  // };

  const [allTasks, setAllTasks] = useState([]);
  const [allFavTasks, setAllFavTasks] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [markedDates, setMarkedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

  const [isShowFav, setShowFav] = useState(false);
  const [isShowAllList, setShowAllList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShowFavTask, setShowFavTask] = useState(false);

  const [isFromCalendar, setFromCalendar] = useState(false);

  const [likedByDate, setLikedByDate] = useState({});
  // console.log('start selecdate = ', selectedDate);



  const { width, height } = Dimensions.get('window');
  const dayWidth = width / 7;

  const contextValue = {
    allTasks, setAllTasks,
    allFavTasks, setAllFavTasks,
    tasks, setTasks,

    markedDates, setMarkedDates,
    selectedDate, setSelectedDate,
    selectedTaskIndex, setSelectedTaskIndex,

    isShowFav, setShowFav,
    isLiked, setIsLiked,
    isShowAllList, setShowAllList,
    isShowFavTask, setShowFavTask,

    isFromCalendar, setFromCalendar,

    likedByDate, setLikedByDate,

  };

  // useEffect(() => {
  //   const subscription = DeviceEventEmitter.addListener('reloadAllFavTasks', ShowFav);
  //   console.log('reloadAllFavTasks');

  //   return () => subscription.remove();
  // }, []);


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

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              bottom: 10,
              left: 16,
              right: 16,
              elevation: 5,
              backgroundColor: 'white',
              borderRadius: 60,
              height: 85,
              paddingBottom: 15,
              borderTopWidth: 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 6.46,
            },
            tabBarIcon: ({ focused }) => {
              let iconSource;

              if (route.name === 'HOME') {
                iconSource = focused
                  ? require('./Image/afterhome.png')
                  : require('./Image/beforehome.png');
              } else if (route.name === 'ALL') {
                iconSource = focused
                  ? require('./Image/afterlist.png')
                  : require('./Image/beforelist.png');
              } else if (route.name === 'ADD') {
                iconSource = focused
                  ? require('./Image/afteradd.png')
                  : require('./Image/beforeadd.png');
              }
              else if (route.name === 'FAV') {
                iconSource = focused
                  ? require('./Image/afterfav.png')
                  : require('./Image/beforefav.png')
              }


              return <Image source={iconSource} style={{ width: 30, height: 30 }} />;
            },
          })}
        >
          <Tab.Screen name="HOME" component={HomeStack} options={{ tabBarLabelStyle: { marginTop: 3, } }} />
          <Tab.Screen name="ALL" component={AllTasksStack} options={{ tabBarLabelStyle: { marginTop: 3, } }} />
          <Tab.Screen name="ADD" component={AddStack} options={{ tabBarLabelStyle: { marginTop: 3, } }} />
          <Tab.Screen name="FAV" component={FavTaskStack} options={{ tabBarLabelStyle: { marginTop: 3, } }} />

        </Tab.Navigator>

      </NavigationContainer>
    </AppContext.Provider>




  );

}
