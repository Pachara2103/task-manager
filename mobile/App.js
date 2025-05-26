import { View, Text, TouchableOpacity, Dimensions, Image, DeviceEventEmitter, Buttontter } from 'react-native';
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
import FavTaskScreen from './FavTaskScreen';

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
function FavTaskStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FavTask" component={FavTaskScreen} options={{ headerShown: false }} />
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
  console.log('-----------------------------------');

  const [allTasks, setAllTasks] = useState([]);
  const [allFavTasks, setAllFavTasks] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [markedDates, setMarkedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

  const [isShowFav, setShowFav] = useState(false);
  const [isShowAllList, setShowAllList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShowFavTask, setShowFavTask] = useState(false);


  const [isFromCalendar, setFromCalendar] = useState(false);

  const [likedByDate, setLikedByDate] = useState({});


  // const [isShowListTask, setShowListTask] = useState(false);

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

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('reloadAllFavTasks', ShowFav);
    console.log('reloadAllFavTasks');

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isShowFavTask) {
      // DeviceEventEmitter.emit('OpenFavTaskScreen');
      console.log('OpenFavTask', isShowFavTask)
    } else {
      // DeviceEventEmitter.emit('CloseFavTaskScreen');
      console.log('CloseFavTask', isShowFavTask)
    }
  }, [isShowFavTask]);


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
              height: 80,
              paddingBottom: 15,
              backgroundColor: 'white',
              borderTopWidth: 0.15,
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
              // else if (route.name === 'ListTask') {
              //   iconSource = focused
              //     ? require('./Image/afterlist.png')
              //     : require('./Image/beforelist.png');
              // }


              return <Image source={iconSource} style={{ width: 30, height: 30 }} />;
            },
          })}
        >
          <Tab.Screen name="HOME" component={HomeStack} options={{ tabBarLabelStyle: { marginTop: 3, } }} />
          <Tab.Screen name="ALL" component={AllTasksStack} options={{ tabBarLabelStyle: { marginTop: 3, } }} />
          <Tab.Screen name="ADD" component={AddStack} options={{ tabBarLabelStyle: { marginTop: 3, } }} />
          {/* <Tab.Screen name="ListTask" component={ListTaskScreen} options={{ tabBarLabelStyle: { marginTop: 3, } }} /> */}
          <Tab.Screen
            name="Heart"
            // component={FavTaskStack}
            options={{
              tabBarButton: (props) => (
                <TouchableOpacity
                  {...props}
                  onPress={() => {
                    // console.log('before press ShowFavTask', isShowFavTask)
                    setShowFavTask(!isShowFavTask)
                    // console.log('ShowFavTask', isShowFavTask)
                  }}>
                  <Image
                    source={
                      isShowFavTask
                        ? require('./Image/afterfav.png')
                        : require('./Image/beforefav.png')
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </TouchableOpacity>
              ),
            }}
          >
            {() => null}
          </Tab.Screen>



        </Tab.Navigator>

        {/* {isShowFavTask && (
          <FavTaskScreen onClose={() => setShowFavTask(false)} />
        )} */}
        <FavTaskScreen
          visible={isShowFavTask}
          onRequestClose={() => setShowFavTask(false)}
        />



      </NavigationContainer>
    </AppContext.Provider>




  );

}
