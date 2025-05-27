// HomeScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Animated, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, DeviceEventEmitter, Modal, TouchableWithoutFeedback } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';



const { width, height } = Dimensions.get('window');
const dayWidth = width / 7;

export default function HomeScreen({ route, navigation }) {
  // const { isBackFromAdd, dateBackFromAdd } = route.params || {};

  const {
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
  } = useContext(AppContext);

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskModalData, setTaskModalData] = useState([]); // task array
  const [modalDate, setModalDate] = useState('');

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const TaskToDelete = async (selectedTaskIndex) => {
    console.log('Call task to delete');

    const key = `tasks-${selectedDate}`;
    const saved = await AsyncStorage.getItem(key);
    let tasks = saved ? JSON.parse(saved) : [];
    // console.log('new task before delete= ', tasks);

    console.log('Deleting task at index:', selectedTaskIndex);

    setSelectedTaskIndex(selectedTaskIndex);
    const newTasks = tasks.filter((_, i) => i !== selectedTaskIndex);
    setTasks(newTasks);
    setTaskModalData(newTasks);

    // console.log('new task after delete= ', newTasks);

    await AsyncStorage.setItem(`tasks-${selectedDate}`, JSON.stringify(newTasks));

    const taskToDelete = tasks[selectedTaskIndex];

    console.log('Deleting task name:', taskToDelete.name, ', Deleting task time', taskToDelete.time, ', date:', selectedDate);


    const savedAll = await AsyncStorage.getItem('allTasks');
    let allTasks = savedAll ? JSON.parse(savedAll) : [];

    allTasks = allTasks.filter(t =>
      !(
        t.name.trim() === taskToDelete.name.trim() &&
        t.time.trim() === taskToDelete.time.trim() &&
        t.date.trim() === selectedDate.trim()
      )
    );
    console.log('All Tasks= ', allTasks);
    await AsyncStorage.setItem('allTasks', JSON.stringify(allTasks));

    console.log('call DeviceEventEmitter');
    DeviceEventEmitter.emit('reloadAllTasksScreen');

    const savedFav = await AsyncStorage.getItem('allFavTask');
    let favList = savedFav ? JSON.parse(savedFav) : [];

    favList = favList.filter(t =>
      !(t.name === taskToDelete.name &&
        t.time === taskToDelete.time &&
        t.date === selectedDate)
    );

    await AsyncStorage.setItem('allFavTask', JSON.stringify(favList));



    if (newTasks.length === 0) {
      // ถ้าไม่มี task แล้ว ลบจาก taskDatesMap
      const jsonMap = await AsyncStorage.getItem('taskDatesMap');
      const dateColorMap = jsonMap ? JSON.parse(jsonMap) : {};
      delete dateColorMap[selectedDate];
      await AsyncStorage.setItem('taskDatesMap', JSON.stringify(dateColorMap));
    }
    loadMarkedDates();
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
  useEffect(() => {
    const loadIsLiked = async () => {
      const favKey = 'allFavTask';
      const favSaved = await AsyncStorage.getItem(favKey);
      let allFavTasks = favSaved ? JSON.parse(favSaved) : [];

      const key = `tasks-${selectedDate}`;
      const saved = await AsyncStorage.getItem(key);
      const tasks = saved ? JSON.parse(saved) : [];

      const makeKey = task => `${task.date}-${task.name}-${task.time}`;
      const taskKeys = new Set(tasks.map(makeKey));
      const favKeys = new Set(allFavTasks.map(makeKey));

      let isAllInFav = true;
      for (let key of taskKeys) {
        if (!favKeys.has(key)) {
          isAllInFav = false;
          break;
        }
      }

      setLikedByDate(prev => ({
        ...prev,
        [selectedDate]: isAllInFav
      }));
    };

    // if (taskModalVisible) {
    loadIsLiked();

    // console.log('test system');
    // console.log('isShowFavTask', isShowFavTask);
  }, [taskModalVisible, selectedDate, isShowFavTask]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadMarkedDates();
      // เริ่มอยู่นอกจอด้านบน
      // Animated.timing(headerAnim, {
      //   toValue: 0,          // เลื่อนลงมาที่ตำแหน่งเดิม
      //   duration: 400,       // ความเร็วในการเลื่อน
      //   useNativeDriver: true,
      // }).start();
      if (isFromCalendar) {
        setFromCalendar(false);
      }
    }
  }, [isFocused]);


  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const positionAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    if (isFromCalendar && isFocused) {
      openModal(startPos.x, startPos.y, selectedDate);
    }
  }, [isFromCalendar && isFocused]);

  const openModal = async (x, y, dateStr) => {
    setModalDate(dateStr);
    const tasksJson = await AsyncStorage.getItem(`tasks-${dateStr}`);
    const tasks = tasksJson ? JSON.parse(tasksJson) : [];
    setTaskModalData(tasks);

    setStartPos({ x, y });
    const ny = y + 50;
    positionAnim.setValue({ x, y });
    scaleAnim.setValue(0);

    setTaskModalVisible(true);


    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnim, {
        toValue: { x: width / 2 + 10, y: height / 2 + 10 },  // เคลื่อนที่ไปกลางจอ
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnim, {
        toValue: startPos,  // เคลื่อนกลับไปจุดที่กด
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTaskModalVisible(false);
    });
  };



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

      if (isLiked) {
        // console.log('Like!!!!!!!!!!!!!!!!!!!!!  date= ', selectedDate);
        // console.log('tasks= ', tasks);

        const existingKeys = new Set(allFavTasks.map(makeKey));
        const merged = [...allFavTasks];

        tasks.forEach(task => {
          const taskKey = makeKey(task);
          if (!existingKeys.has(taskKey)) {
            merged.push(task);
          }
        });

        await AsyncStorage.setItem(favKey, JSON.stringify(merged));
        setAllFavTasks(merged);

        const a = await AsyncStorage.getItem(favKey);
        let b = a ? JSON.parse(a) : [];
        // console.log('allFavTask= ', b);

      } else {
        // console.log('Like!!!!!!!!!!!!!!!!!!!!!  date= ', selectedDate);
        // console.log('tasks= ', tasks);
        const removeKeys = new Set(tasks.map(makeKey));
        const filtered = allFavTasks.filter(task => !removeKeys.has(makeKey(task)));

        await AsyncStorage.setItem(favKey, JSON.stringify(filtered));

        const a = await AsyncStorage.getItem(favKey);
        let b = a ? JSON.parse(a) : [];
        // console.log('allFavTask= ', b);

      }
    };

    handleLike();
    // }, [likedByDate[selectedDate]]);
  }, [likedByDate, selectedDate]);




  const renderDay = ({ date, state }) => {
    const isDisabled = state === 'disabled';
    const isToday = state === 'today';

    const mark = markedDates[date.dateString];
    const isMarked = mark?.marked;
    const dotColor = mark?.dotColor || 'blue';

    return (
      <TouchableOpacity onPress={(event) => {
        const { locationX, locationY, pageX, pageY } = event.nativeEvent;
        const dateStr = dayjs(date.dateString).format('YYYY-MM-DD');
        openModal(pageX, pageY, dateStr);
        setSelectedDate(dayjs(date.dateString).format('YYYY-MM-DD')); ///set seletedDate

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

    <View style={{
      height: height - 120,
      backgroundColor: 'white',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingRight: 50,

      borderRadius: 40,         // ขอบโค้ง
      overflow: 'hidden',       // ต้องมี เพื่อให้ตัดขอบลูก
      marginHorizontal: 10,     // เผื่อเว้นขอบไม่ติดจอ
      marginVertical: 10,  
      elevation: 5,             // เงาสำหรับ Android
      shadowColor: '#000',      // เงาสำหรับ iOS
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    }}>
      {/* <View
        style={{
          width: width,
          height: 100,
          marginTop:80,
          backgroundColor: '#DBE2EF',
        }}
      >
        <Text style={{
          textAlign: 'center',
          marginTop: 62.5,
          fontSize: 18,
        }}>
          CALENDAR
        </Text>
      </View> */}

      <CalendarList
        current={dayjs().format('YYYY-MM-DD')} // เดือนปัจจุบัน
        pastScrollRange={120}  // ย้อนหลัง 10 ปี
        futureScrollRange={120} // ล่วงหน้า 10 ปี
        scrollEnabled={true}
        horizontal={false} // แนวตั้ง
        pagingEnabled={false}
        showScrollIndicator={true}
        hideArrows={true} // ไม่แสดงลูกศร
        hideExtraDays={true}
        dayComponent={renderDay}
        markedDates={markedDates}
        hideDayNames={true}

        renderHeader={(date) => {
          const month = dayjs(date).format('MMMM YYYY');
          return (
            <View style={{
              width: width,
              height: 80,
              paddingBottom: 10,
              paddingRight: 20,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'red',
              position: "absolutes",
              top: 10,
              right: 30

            }}>
              <View style={{
                height: 2,
                width: width - 40,
                backgroundColor: '#ccc',
                position: 'absolute',
                right:25,
                bottom: 80,
                opacity: 0.2,
              }} />
              <Text style={[
                styles.monthHeader, {

                }]}>{month}</Text>

              <View style={{
                width: width - 40,
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 5,
                backgroundColor: 'green',
                marginLeft: 20,
                gap: 21.5
              }}>

                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (

                  <View key={index} style={styles.dayBox}>
                    <Text style={{ position: 'absolute', bottom: 0, fontSize: 12, fontWeight: 'bold' }} >
                      {day}
                    </Text>

                  </View>
                ))}
              </View>
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
        style={{ width }}
      />

      < Modal
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <Animated.View style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 15,

                position: 'absolute',
                width: width / 2 + 140,
                height: height / 2 - 100,
                backgroundColor: 'white',
                borderRadius: 10,
                transform: [
                  { translateX: positionAnim.x },
                  { translateY: positionAnim.y },
                  { scale: scaleAnim },
                ],
                marginLeft: -820 / 2,
                marginTop: -1680 / 2,

              }}>

                <TouchableOpacity
                  onPress={() => {
                    setLikedByDate(prev => ({
                      ...prev,
                      [selectedDate]: !prev[selectedDate]
                    }));
                  }}>

                  <Image
                    source={
                      likedByDate[selectedDate]
                        ? require('./Image/fullheart.png')
                        : require('./Image/noheart.png')
                    }
                    style={{ width: 30, height: 30, position: 'absolute', top: 0, right: 0 }}
                  />
                </TouchableOpacity>


                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: 10,
                }}>{modalDate}</Text>

                <ScrollView style={{ backgroundColor: 'pink', marginBottom: 30 }}>
                  {taskModalData.length === 0 ? (
                    <Text style={{ fontSize: 20, fontWeight: 'thin', textAlign: 'center', justifyContent: 'center', marginTop: 100 }}>No Task Yet</Text>
                  ) : (
                    taskModalData.map((task, index) => (
                      <View key={index} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginVertical: 6,
                      }}>

                        <Image
                          source={require('./Image/clock.png')}
                          style={{ width: 20, height: 20, marginRight: 5 }}
                        />
                        <Text style={{ width: 50 }}>{(task.time || '00:00').replace(':', '.')}</Text>

                        <View style={{
                          flex: 1,
                          padding: 8,
                          backgroundColor: '#DBE2EF',
                          borderRadius: 6,
                        }}>
                          <Text>{task.name}</Text>
                        </View>

                        <TouchableOpacity onPress={() => {
                          TaskToDelete(index);
                        }}>
                          <Image
                            source={require('./Image/delete.png')}
                            style={{ width: 20, height: 20, marginLeft: 8 }}
                          />

                        </TouchableOpacity>
                      </View>
                    ))
                  )}

                </ScrollView>

                <View style={{
                  position: 'absolute',
                  bottom: 10, // ระยะห่างจากล่างสุด (ปรับได้)
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}>

                  <TouchableOpacity onPress={(event) => {
                    //ไปยังหน้า add กด add เสร็มกลับมาหน้า home ที่โช modal ไว้
                    setFromCalendar(true);
                    navigation.navigate('ADD', {
                      isFromCalendar: true,
                      dateFromCalendar: selectedDate,
                    });
                    closeModal();
                    // console.log('dateFromCalendar', selectedDate);
                  }}>

                    <Image
                      source={require('./Image/add.png')}
                      style={{ width: 35, height: 35, marginRight: 5 }}
                    />
                  </TouchableOpacity>

                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback >
      </Modal >



    </View >
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: 'blue',
    marginRight: 20,

  },
  ImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  dayBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
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
    backgroundColor: '#A6E3E9',
    // opacity:0.2,
  },
  monthHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 10,
    color: '#ccc',
  },



});
