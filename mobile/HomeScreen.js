// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, DeviceEventEmitter } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const dayWidth = width / 7;

export default function HomeScreen({ navigation }) {
  const [markedDates, setMarkedDates] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const [allFavTasks, setAllFavTasks] = useState([]);
  const [isShowFav, setShowFav] = useState(false);
  const [isShowAllList, setShowAllList] = useState(false);



  // ใน HomeScreen
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

    const unsubscribe = navigation.addListener('focus', loadMarkedDates);
    return unsubscribe;
  }, []);

  const handleShowAllTasks = async () => {
    // await AsyncStorage.removeItem('allFavTask');
    // console.log('✅ ล้าง allFavTask แล้ว');

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
      setShowFav(false);
      setShowAllList(true);
      console.log('📦 allTask:', allTasks);
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

      // จัดกลุ่ม tasks ตามวันที่
      const groupedFavTasks = favTasks.reduce((acc, task) => {
        if (!acc[task.date]) {
          acc[task.date] = [];
        }
        acc[task.date].push(task);
        return acc;
      }, {});

      // const groupedFavTasks = favTasks.reduce((acc, item) => {
      //   if (!acc[item.date]) {
      //     acc[item.date] = [];
      //   }
      //   acc[item.date] = acc[item.date].concat(item.tasks);
      //   return acc;
      // }, {});

      const favTasksList = Object.keys(groupedFavTasks)
        .sort((a, b) => dayjs(a).unix() - dayjs(b).unix())
        .map(date => ({
          date,
          tasks: groupedFavTasks[date].sort((a, b) => a.time.localeCompare(b.time))
        }));

      setAllFavTasks(favTasksList);
      setShowFav(true);
      setShowAllList(false);
      console.log('📦 allFavTask:', favTasks);
    } catch (e) {
      console.log('Error loading favorite tasks:', e);
    }
  };




  const renderDay = ({ date, state }) => {
    const isDisabled = state === 'disabled';
    const isToday = state === 'today';

    const handleDayPress = () => {
      const selectedDate = dayjs(date.dateString).format('YYYY-MM-DD');
      navigation.navigate('List-Task', { selectedDate, isShowFav, isShowAllList });
    };

    const mark = markedDates[date.dateString];
    const isMarked = mark?.marked;
    const dotColor = mark?.dotColor || 'blue';

    return (
      <TouchableOpacity onPress={handleDayPress} style={[styles.dayContainer, { width: dayWidth }]}>
        <View style={styles.dayBox}>
          <Text
            style={[
              styles.dayText,
              isDisabled && styles.disabledText,
              isToday && styles.todayText,
            ]}
          >
            {date.day}
          </Text>
          <View style={[styles.dot, isDisabled && styles.dotDisable, { backgroundColor: isMarked ? dotColor : 'transparent' }]} />

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ width: width, height: height / 2.2, paddingVertical: 10 }}>
        <Calendar
          //  markedDates={markedDates}
          hideDayNames={false}
          hideArrows={false}
          current={new Date().toISOString().split('T')[0]}
          dayComponent={renderDay}
          style={{ width: width }}
          theme={{ todayTextColor: '#00adf5' }}
        />
      </View>

      <View
        style={{
          width: width,
          height: height / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          width: 50,
          height: height / 2,
          zIndex: 10,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: 10,
          gap: 10, // ใช้ได้ใน React Native >= 0.71 หรือใช้ marginRight แทน
          backgroundColor: '#F2BEFC',

        }}>
          <View style={styles.ImageContainer}>

            <TouchableOpacity onPress={ShowFav} style={styles.ImageContainer}>
              <Image
                source={require('./Image/heart.png')}
                style={{ width: 45, height: 45 }} />
            </TouchableOpacity>

          </View>
          <View style={styles.ImageContainer}>
            <TouchableOpacity onPress={handleShowAllTasks} style={styles.ImageContainer}>
              <Image source={require('./Image/list.png')} style={{ width: 32, height: 32 }} />
            </TouchableOpacity>

          </View>
        </View>

        {isShowAllList && (
          <View style={styles.ImageTitle}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, left: 135, top: 12.5, color: 'black' }}>ALL-LIST</Text>
          </View>
        )}

        {isShowAllList && (

          <ScrollView style={{ padding: 10, maxHeight: height / 2 - 100, width: width, backgroundColor: '#F3E0EC', left: 50 }}>
            {allTasks.map((group) => (
              <View key={group.date} style={{ marginBottom: 12 }}>


                <Text style={{ fontWeight: 'bold', color: dayjs(group.date).isBefore(dayjs(), 'day') ? 'gray' : 'black' }}>

                  {dayjs(group.date).format('DD MMM YYYY')}
                </Text>
                {group.tasks.map((task, index) => {
                   const now = dayjs();
                  const timeFormatted = task.time.replace('.', ':');
                  const taskDateTime = dayjs(`${group.date} ${timeFormatted}`, 'YYYY-MM-DD HH:mm');
                  const isPast = taskDateTime.isBefore(now);

                  return (
                    <Text
                      key={index}
                      style={{
                        color: isPast ? 'gray' : 'black',
                        opacity: isPast ? 0.5 : 1,
                        marginLeft: 8,
                        marginTop: 4,
                      }}
                    >
                      {task.time || '00.00'} : {task.name}
                    </Text>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )}

        {isShowFav && (
          <ScrollView
            style={{
              padding: 10, maxHeight: height / 2 - 100, width: width, backgroundColor: '#F3E0EC', left: 50,
            }}
          >
            {allFavTasks.map((group) => (
              <View key={group.date} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', color: dayjs(group.date).isBefore(dayjs(), 'day') ? 'gray' : 'black' }}>
                  {dayjs(group.date).format('DD MMM YYYY')}
                </Text>
                {group.tasks.map((task, index) => {
                  const now = dayjs();
                  const timeFormatted = task.time.replace('.', ':');
                  const taskDateTime = dayjs(`${group.date} ${timeFormatted}`, 'YYYY-MM-DD HH:mm');
                  console.log("timeFormatted");
                  const isPast = taskDateTime.isBefore(now);
                  console.log('isPast', isPast);

                  return (
                    <Text
                      key={index}
                      style={{
                        color: isPast ? 'gray' : 'black',
                        opacity: isPast ? 0.5 : 1,
                        marginLeft: 8,
                        marginTop: 4,
                      }}
                    >
                      {task.time || '00.00'} : {task.name}
                    </Text>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )}

        {isShowFav && (
          <View style={styles.ImageTitle}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, left: 135, top: 12.5, color: 'black' }}>FAV-LIST</Text>
          </View>
        )}




      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  ImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#2d4150',
  },
  disabledText: {
    color: '#d9e1e8',
  },
  todayText: {
    fontWeight: 'bold',
    color: '#00adf5',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    marginTop: 1,
    alignSelf: 'center',
  },
  dotDisable: {
    width: 6,
    height: 6,
    borderRadius: 4,
    marginTop: 1,
    alignSelf: 'center',
    opacity: 0.2,
  },

  ImageTitle: {
    position: 'absolute',
    height: 50,
    width: width,
    top: 0,
    left: 50,
    backgroundColor: 'gray',
    // opacity:0.2,
  }


});
