// HomeScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Animated, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const dayWidth = width / 7;

export default function HomeScreen({ route, navigation }) {

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayColour = [
    '#FF0B55', // Sunday 
    '#F3C623', // Monday 
    '#FF90BB', // Tuesday  
    '#27ae60', // Wednesday
    '#FF9B45', // Thursday
    '#4ED7F1', // Friday
    '#CB9DF0', // Saturday
  ];
  const renderRightActions = (idx) => (
    <TouchableOpacity onPress={() => TaskToDelete(idx)}>
      <View style={styles.rightAction}>
        <Image source={require('./Image/delete.png')} style={{ width: 18, height: 18, marginTop: 10, marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );

  const {
    allTasks, setAllTasks,
    allFavTasks, setAllFavTasks,
    tasks, setTasks,

    markedDates, setMarkedDates,
    selectedDate, setSelectedDate,
    selectedTaskIndex, setSelectedTaskIndex,

    isFromCalendar, setFromCalendar,
    likedByDate, setLikedByDate,

  } = useContext(AppContext);

  const TaskToDelete = async (selectedTaskIndex) => {
    const key = `tasks-${selectedDate}`;
    const saved = await AsyncStorage.getItem(key);
    let tasks = saved ? JSON.parse(saved) : [];

    setSelectedTaskIndex(selectedTaskIndex);
    const newTasks = tasks.filter((_, i) => i !== selectedTaskIndex);
    // setTasks(newTasks);
    setNowTask(newTasks);
    await AsyncStorage.setItem(`tasks-${selectedDate}`, JSON.stringify(newTasks));

    const taskToDelete = tasks[selectedTaskIndex];
    const savedAll = await AsyncStorage.getItem('allTasks');
    let allTasks = savedAll ? JSON.parse(savedAll) : [];

    allTasks = allTasks.filter(t =>
      !(
        t.name.trim() === taskToDelete.name.trim() &&
        t.time.trim() === taskToDelete.time.trim() &&
        t.date.trim() === selectedDate.trim()
      )
    );
    await AsyncStorage.setItem('allTasks', JSON.stringify(allTasks));
    // setAllTask(allTasks);

    const savedFav = await AsyncStorage.getItem('allFavTask');
    let favList = savedFav ? JSON.parse(savedFav) : [];

    favList = favList.filter(t =>
      !(t.name === taskToDelete.name &&
        t.time === taskToDelete.time &&
        t.date === selectedDate)
    );

    await AsyncStorage.setItem('allFavTask', JSON.stringify(favList));
    setAllFavTasks(favList);

    // await AsyncStorage.setItem('allFavTask', JSON.stringify([]));

    if (newTasks.length === 0) {
      // ถ้าไม่มี task แล้ว ลบจาก taskDatesMap
      const jsonMap = await AsyncStorage.getItem('taskDatesMap');
      const dateColorMap = jsonMap ? JSON.parse(jsonMap) : {};
      delete dateColorMap[selectedDate];
      await AsyncStorage.setItem('taskDatesMap', JSON.stringify(dateColorMap));
      loadMarkedDates();
    }
  }



  const loadMarkedDates = async () => {
    try {
      const jsonDatesMap = await AsyncStorage.getItem('taskDatesMap');
      const datesMap = jsonDatesMap ? JSON.parse(jsonDatesMap) : {};

      const updatedMarks = {};
      // const colors = ['pink', 'orange', 'red', 'green', 'purple'];

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
      console.log('loading mark dateeeeeeeeeeeeee');
    } catch (e) {
      console.log('Error loading marked dates:', e);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    const IfAdd = async () => {
      const key = `tasks-${selectedDate}`;
      const saved = await AsyncStorage.getItem(key);
      let tasks = saved ? JSON.parse(saved) : [];
      setNowTask(tasks);
    };
    IfAdd();
    loadMarkedDates();

  }, [isFocused]);

  useEffect(() => {
    const isLiked = likedByDate[selectedDate]; // ค่าของวันที่เปิดอยู่
    if (isLiked === undefined) return;

    const handleLike = async () => {
      const key = `tasks-${selectedDate}`;
      const saved = await AsyncStorage.getItem(key);
      const tasks = saved ? JSON.parse(saved) : [];

      const favKey = 'allFavTask';
      const favSaved = await AsyncStorage.getItem(favKey);
      let allFavTasks = favSaved ? JSON.parse(favSaved) : [];

      const makeKey = task => `${task.date}-${task.name}-${task.time}`;
      if (isLiked && tasks.length === 0) {
        Alert.alert(`No task on this day`);

        // เซต likedByDate[selectedDate] = false
        setLikedByDate(prev => ({
          ...prev,
          [selectedDate]: false,
        }));

        return;
      }

      if (isLiked) {

        const existingKeys = new Set(allFavTasks.map(makeKey));
        const merged = [...allFavTasks];

        tasks.forEach(task => {
          const taskKey = makeKey(task);
          if (!existingKeys.has(taskKey)) {
            merged.push(task);
          }
        });
        merged.sort((a, b) => {
          const dateDiff = dayjs(a.date).diff(dayjs(b.date));
          if (dateDiff !== 0) return dateDiff;

          const timeA = dayjs(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm');
          const timeB = dayjs(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm');
          const timeDiff = timeA.diff(timeB);
          if (timeDiff !== 0) return timeDiff;

          return a.name.localeCompare(b.name);
        });


        await AsyncStorage.setItem(favKey, JSON.stringify(merged));
        setAllFavTasks(merged);

      } else {

        const removeKeys = new Set(tasks.map(makeKey));
        const filtered = allFavTasks.filter(task => !removeKeys.has(makeKey(task)));

        await AsyncStorage.setItem(favKey, JSON.stringify(filtered));
        setAllFavTasks(filtered);
      }
    };

    handleLike();
    console.log('checkkkkkkkkkkkkkkkkkkkkk');

  }, [likedByDate]);

  const categoryImages = {
    exercise: require('./Image/category/exercise.png'),
    dinner: require('./Image/category/eating.png'),
    book: require('./Image/category/book.png'),
    homework: require('./Image/category/homework.png'),
    meeting: require('./Image/category/meeting.png'),
    reminder: require('./Image/category/reminder.png'),
    sleep: require('./Image/category/sleep.png'),
  };
  const scrollviewColour = ["#FAA0A0", "#FFF8DE", '#F7CFD8', '#DDF6D2', '#FFE8CD', '#D1E9F6', '#E5D9F2']

  const [pressday, setPressDay] = useState(true);
  const [nowtask, setNowTask] = useState([]);
  const [isPast, setIsPast] = useState(false);
  const [isTimePast, setIsTimePast] = useState(false);

  useEffect(() => {
    const setShowNowTask = async (selectedDate) => {
      const key = `tasks-${selectedDate}`;
      const saved = await AsyncStorage.getItem(key);
      let tasks = saved ? JSON.parse(saved) : [];
      setNowTask(tasks);
      setIsPast(dayjs(selectedDate).isBefore(dayjs().format('YYYY-MM-DD'), 'day'));
      const taskDateTime = dayjs(`${nowtask.date} ${nowtask.time}`, 'YYYY-MM-DD HH:mm');
      setIsTimePast(taskDateTime.isBefore(dayjs()));

      console.log('set now task leawwwwwwwwwwwwwww');
      // console.log('now task=', nowtask);

    }
    setShowNowTask(selectedDate);
  }, [selectedDate]);

  const renderDay = ({ date, state }) => {
    const isDisabled = state === 'disabled';
    const isToday = state === 'today';

    const mark = markedDates[date.dateString];
    const isMarked = mark?.marked;
    const dotColor = mark?.dotColor || 'blue';

    return (
      <TouchableOpacity onPress={(event) => {

        setSelectedDate(dayjs(date.dateString).format('YYYY-MM-DD')); ///set seletedDate
        setPressDay(true);

        console.log('press day leawwwwwwwwww');

      }} style={[styles.dayContainer, { width: dayWidth }]}>
        <View style={[
          styles.dayBox,
          isMarked && {
            backgroundColor: dotColor,
            borderRadius: 70,
          },
        ]}>
          <Text
            style={[
              styles.dayText,
              isDisabled && styles.disabledText,
              isToday && styles.todayText,
              isMarked && { color: 'white' }, // เปลี่ยนสีตัวเลขให้ตัดกับพื้นหลัง
            ]}
          >
            {date.day}
          </Text>

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={{
        width: width,
        height: 160,
        flexDirection: 'column',
        backgroundColor: '#DBE2EF',
        // marginBottom:5

      }}>

        <View style={{ justifyContent: 'flex-start', marginTop: 80, height: 40, width: width }}>
          <Text style={{ textAlign: 'left', fontSize: 30, fontWeight: 'bold', marginLeft: 10 }}>
            CALENDAR
          </Text>

        </View>

        <View style={{ height: 30, width: width - 20, justifyContent: 'flex-start', marginLeft: 10 }}>
          <Text style={{ fontSize: 15 }}>
            {dayjs().format('dddd')},  {dayjs().date()} {months[dayjs().month()]} {dayjs().year()}
          </Text>


        </View>

        <View style={{  position: 'absolute', right: 20, top: 90, borderRadius:40, width: 50, height: 50, backgroundColor:'white' }}>
          <Image
            source={require('./Image/cat.png')}
            style={{ width: 40, height: 40, marginLeft:7.,marginTop:3 }}
          />
        </View>


      </View>


      <Calendar
        current={dayjs().format('YYYY-MM-DD')}
        // hideArrows={true} // ไม่แสดงลูกศร
        // hideExtraDays={true}
        dayComponent={renderDay}
        markedDates={markedDates}
        // hideDayNames={true}

        renderHeader={(date) => {
          const month = dayjs(date).format('MMMM YYYY');
          return (
            <View style={{
              width: width - 250,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'red',

            }}>
              <Text style={{
                fontSize: 15,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ccc',
              }}>{month}</Text>

            </View>
          );
        }}

        theme={{
          textSectionTitleColor: 'black',
          textDayHeaderFontWeight: 'bold',
          todayTextColor: '#00adf5',
          monthTextColor: '#333',
          textMonthFontWeight: 'bold',

        }}
        style={{ width: width, borderRadius: 20, height: 290 }}
      />
      {pressday &&
        <View>
          <Text style={{
            textAlign: 'center',
            fontSize: 15,
            marginBottom: 10,
          }}>

            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{dayjs(selectedDate).date()} {months[dayjs(selectedDate).month()]}</Text>

          </Text>

          <Text style={{ opacity: 0.6, fontSize: 12, fontFamily: 'lucida grande', color: dayColour[dayjs(selectedDate).day()], fontWeight: 'bold', position: 'absolute', top: 20, left: 185 }}>
            {dayjs(selectedDate).format('ddd')}

          </Text>

          <TouchableOpacity onPress={() => {
            setLikedByDate(prev => ({
              ...prev,
              [selectedDate]: !prev[selectedDate]
            }));
            console.log('likedbydate=', likedByDate);
          }}

            style={{ position: 'absolute', top: 2, right: 110 }} >
            <Image
              source={
                likedByDate[selectedDate] ?
                  require('./Image/fullheart2.png') :
                  require('./Image/noheart.png')
              }

              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>

        </View>
      }

      {pressday &&
        <GestureHandlerRootView >
          <View style={{
            width: width,
            height: 260,
            // backgroundColor: '#DDF6D2',
            backgroundColor: scrollviewColour[dayjs(selectedDate).day()],
            // opacity: dayjs(selectedDate).day() == 0 ? 0.5 : 1,
            borderRadius: 40
          }}>

            <ScrollView contentContainerStyle={{
              paddingHorizontal: 10,
            }}>

              <View style={[styles.dayContainer, isPast && { opacity: 0.5 }]}>

                {nowtask.length === 0 ? (
                  <View style={{ alignItems: 'center', marginTop: 100 }}>
                    <Text style={{ fontSize: 20, color: 'gray' }}>No task on this day</Text>
                  </View>
                ) : (
                  nowtask.map((task, idx) => {
                    return (
                      <Swipeable key={idx} renderRightActions={() => renderRightActions(idx)}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8,
                          opacity: isTimePast ? 0.5 : 1,
                          // backgroundColor: 'red',
                          width: width - 25,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                            <Image
                              source={require('./Image/clock.png')}
                              style={{ width: 15, height: 15 }}
                            />
                            <Text style={styles.timeText}>
                              { } {(task.time || '00:00').replace(':', '.')}
                            </Text>
                          </View>

                          <View style={{
                            flex: 1,
                            backgroundColor: '#fbfcfc',
                            padding: 10,
                            borderRadius: 15,
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                            alignItems: 'left',
                            flexDirection: 'colum',

                            // gapcolum:5,
                            // backgroundColor: 'red',
                          }}>
                            <Text style={{ fontSize: 14, }}>{task.name}</Text>
                            {task.category && categoryImages[task.category] && (
                              <Image
                                source={categoryImages[task.category]}
                                style={{ width: 35, height: 35, position: 'absolute', right: 5, }}
                              />
                            )}

                            {task.category === 'homework' && (
                              <View style={{ flexDirection: 'row', gap: 5 }}>
                                <Image
                                  source={require("./Image/deadline.png")}
                                  style={{ width: 12, height: 12 }}
                                />

                                <Text style={{ fontSize: 12, }}>deadline {dayjs(task.deadline).format('DD MMM YYYY')}</Text>



                              </View>

                            )}
                            {task.category === 'homework' && (
                              <Text style={{ fontSize: 14, color: Math.max(dayjs(task.deadline).diff(dayjs(), 'day'), 0) < 7 ? "red" : 'green' }}>
                                {Math.max(dayjs(task.deadline).diff(dayjs(), 'day'), 0)} day left
                              </Text>
                            )}



                          </View>

                        </View>
                      </Swipeable>

                    );
                  })
                )}

              </View>




            </ScrollView >

            <TouchableOpacity onPress={() => {
              setFromCalendar(true);
              navigation.navigate('ADD', {
                // isFromCalendar: true,
              });

              // console.log('set from calendar')
            }}

              style={{ position: 'absolute', bottom: 10, right: 175 }} >
              <Image
                source={
                  require('./Image/add.png')
                }
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>

          </View>
        </GestureHandlerRootView>
      }

    </View >
  );
}

const styles = StyleSheet.create({
  dateText: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 10,
  },

  timeText: {
    width: 60,
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold'
  },

  dayContainer: {
    alignItems: 'center',
    // marginVertical: 2,
    //  backgroundColor: 'pink',

  },
  ImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  dayBox: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'pink',
    width: 30, height: 30

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

});
