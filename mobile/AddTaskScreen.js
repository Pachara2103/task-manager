import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
  Button, TouchableWithoutFeedback, Keyboard, Alert, Dimensions, Image, DeviceEventEmitter
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { AppContext } from './AppContext';
import dayjs from 'dayjs';
import moment from 'moment-timezone';
import DateTimePickerModal from 'react-native-modal-datetime-picker';


//ให้วนลูปในtaskdate หลังจากลบ taskไหน ว่ามร task เหลือในวันนั้นมั้ย taskDates: ["2025-05-21", "2025-05-22"]
//ถ้าบวกให้ดูว่ามียังมีเเล้วไม่ต้องเพิ่ม
const { width, height } = Dimensions.get('window');



export default function AddTaskScreen({ route, navigation }) {


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

    isFromCalendar, setFromCalendar,

  } = useContext(AppContext);
  // setDate, เเก้อันนี้ด้วยยยยยยยยยยยยยยยยยยยย เเก้ให้ add เเล้ว add ใน alltask, allfavtask if liked

  const [taskName, setTaskName] = useState('');
  const [taskDes, setTaskDes] = useState('');
  const { taskToEdit, dateFromCalendar } = route.params || {};
  console.log(' isFromCalendar', isFromCalendar);

  const [time, setTime] = useState({ hour: '00', min: '00' });
  const [tempHour, setTempHour] = useState('00');
  const [tempMin, setTempMin] = useState('00');

  const [modalVisible, setModalVisible] = useState(false);

  const [pickdate, setPickedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);


  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มนับ 0
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    setSelectedDate(formattedDate);
    setPickedDate(selectedDate);
    console.log("confirm date= ", formattedDate)
    hideDatePicker();
  };

  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  //ถ้ามี taskToEdit จะเอาค่าเดิมมาใส่
  useEffect(() => {
    if (taskToEdit) {
      setTaskName(taskToEdit.name);
      const [h, m] = taskToEdit.time.split(':');
      setTime({ hour: h, min: m });
    }
    else {
      setTaskName('');
      setTime({ hour: '00', min: '00' });
    }
  }, [taskToEdit]);

  useEffect(() => {
    if (isFromCalendar) {
      // setTaskName(taskToEdit.name)
      setTaskName('');
      const [year, month, day] = selectedDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      handleConfirm(dateObj);
      setPickedDate(dateObj);
      console.log('call handleConfirm  of dateFromCalendar');
    }
  }, [isFromCalendar]);


  const handleAddTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('กรุณาใส่ชื่อ Task');
      return;
    }
    const newTask = {
      name: taskName,
      time: `${time.hour}:${time.min}`,
      date: selectedDate
    };

    const key = `tasks-${selectedDate}`;

    try {
      const saved = await AsyncStorage.getItem(key);
      let tasks = saved ? JSON.parse(saved) : []; //task วันนั้นวันเดียว

      // ถ้าเป็น edit → ลบ task เดิม
      if (taskToEdit) {
        tasks = tasks.filter(
          (t) => !(t.name === taskToEdit.name && t.time === taskToEdit.time)
        );
      }
      //เวลาไม่ซ้ำ
      const isTimeConflict = tasks.some((t) => t.time === newTask.time);
      if (isTimeConflict) {
        Alert.alert('This time is busy');
        return;
      }
      tasks.push(newTask);
      tasks.sort((a, b) => a.time.localeCompare(b.time));
      await AsyncStorage.setItem(key, JSON.stringify(tasks));

      const savedAll = await AsyncStorage.getItem('allTasks');
      let allTasks = savedAll ? JSON.parse(savedAll) : [];

      if (taskToEdit) {
        allTasks = allTasks.filter(
          (t) =>
            !(
              t.name === taskToEdit.name &&
              t.time === taskToEdit.time &&
              t.date === taskToEdit.date
            )
        );
      }

      allTasks.push(newTask);
      allTasks.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      });
      await AsyncStorage.setItem('allTasks', JSON.stringify(allTasks));
      DeviceEventEmitter.emit('reloadAllTasks');
      console.log('call reload all task screen affter add task')

      ////// for allFavTask
      if (isLiked) {
        try {
          const favJson = await AsyncStorage.getItem('allFavTask');
          let favList = favJson ? JSON.parse(favJson) : [];

          if (taskToEdit) {
            favList = favList.filter(
              (t) =>
                !(
                  t.name === taskToEdit.name &&
                  t.time === taskToEdit.time &&
                  t.date === taskToEdit.date
                )
            );
          }

          favList.push(newTask);
          favList.sort((a, b) => {
            if (a.date === b.date) {
              return a.time.localeCompare(b.time);
            }
            return a.date.localeCompare(b.date);
          });

          await AsyncStorage.setItem('allFavTask', JSON.stringify(favList));

        } catch (e) {
          console.log('Error updating allFavTask:', e);
        }
      }

      // Update Date Color Mapping
      try {
        const jsonMap = await AsyncStorage.getItem('taskDatesMap');
        const dateColorMap = jsonMap ? JSON.parse(jsonMap) : {};
        if (!dateColorMap[selectedDate]) {
          const colors = ['#CD5656', '#9B7EBD', '#8DD8FF', '#FFB26F', '#84AE92'];
                            //เเดง     ,  ม่วง    ,  ฟ้า   ,   ส้ม  ,     เขียว  ,
          const usedColors = Object.values(dateColorMap);
          const availableColors = colors.filter(c => !usedColors.includes(c));
          const colorPool = availableColors.length > 0 ? availableColors : colors;
          const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];

          dateColorMap[selectedDate] = randomColor;
          await AsyncStorage.setItem('taskDatesMap', JSON.stringify(dateColorMap));
        }
        console.log('taskdatemap= ', dateColorMap);//{"2025-05-22": "red", "2025-05-23": "orange"}

      } catch (e) {
        console.log('Error assigning color to date:', e);
      }

      // Update Task Dates
      try {
        const jsonDates = await AsyncStorage.getItem('taskDates');
        let dates = jsonDates ? JSON.parse(jsonDates) : [];

        if (!dates.includes(selectedDate)) {
          dates.push(selectedDate);
          await AsyncStorage.setItem('taskDates', JSON.stringify(dates));
        }
        console.log('taskDates:', dates);
      } catch (e) {
        console.log('Error updating taskDates:', e); //["2025-05-21", "2025-05-22", "2025-05-23"]
      }

      Alert.alert('Successfully Add Task');
      if (isFromCalendar) {
        navigation.navigate('Home', {
          isFromCalendar: true,
          // dateBackFromAdd: dateFromCalendar,
        });
      }

    } catch (e) {
      console.log("Error saving task:", e);
    }


  };


  return (

    <View style={{ flex: 1 }}>
      <View style={{
        width: width,
        height: 100,
        backgroundColor: '#DBE2EF',
      }}>
        <Text style={{
          textAlign: 'center',
          marginTop: 62.5,
          fontSize: 18,
        }}>ADD NEW TASK
        </Text>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <View style={styles.container}>
          <View style={{
            // backgroundColor: 'green',
            width: width - 20,
            height: 100,
            marginLeft: -10
          }}>

            <Text style={styles.label}>Title Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Add Task Name..."
              value={taskName}
              onChangeText={setTaskName}
            />

          </View>

          <View style={{
            // backgroundColor: 'green',
            width: width - 20,
            height: 150,
            marginLeft: -10

          }}>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.Description}
              placeholder="Add Description..."
              value={taskDes}
              onChangeText={setTaskDes}
              multiline={true}
              textAlignVertical="top"
            />

          </View>

          <View style={{
            // backgroundColor: 'green',
            width: width - 20,
            height: 100,
            marginLeft: -10,
            flexDirection: 'row',

          }}>

            <View style={{ width: width / 2 - 10, height: 100 }}>

              <Text style={styles.label}>Date:</Text>
              <TouchableOpacity style={styles.timeBox} onPress={showDatePicker}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('./Image/calendar.png')} // ใส่ path ไอคอนของคุณ
                    style={{ width: 20, height: 20, marginRight: 8 }}
                  />
                  <Text style={styles.timeText}>{formatDate(pickdate)}</Text>


                </View>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={pickdate}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                locale="en-GB" // <- ป้องกันไม่ให้แสดง BE
                display="inline" // หรือ "inline", "default", แล้วแต่ต้องการ
                themeVariant="light" // เพื่อให้ text แสดงเป็นสีดำ:
              />

            </View>

            <View style={{ width: width / 2 - 10, height: 100 }}>
              <Text style={styles.label}>Time:</Text>

              <TouchableOpacity style={styles.timeBox} onPress={() => setTimePickerVisible(true)}>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                  <Image
                    source={require('./Image/clock.png')} // ใส่ path ไอคอนของคุณ
                    style={{ width: 20, height: 20, marginRight: 8 }}
                  />
                  <Text style={styles.timeText}> {time.hour}:{time.min} </Text>
                </View>

              </TouchableOpacity>

            </View>

          </View>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            display="spinner" // 👈 ทำให้เป็นแบบ spinner
            locale="en-GB" // ป้องกันแสดง BE บน iOS
            themeVariant="light" // เพื่อให้ text แสดงเป็นสีดำ:

            date={new Date(0, 0, 0, parseInt(time.hour), parseInt(time.min))}
            onConfirm={(pickdate) => {
              const local = moment(pickdate).tz('Asia/Bangkok');
              const h = local.format('HH');
              const m = local.format('mm');

              console.log("confirm Time", h + ":" + m);
              console.log("selectedDate:", pickdate);


              setTime({ hour: h, min: m });
              setTimePickerVisible(false);
            }}
            onCancel={() => setTimePickerVisible(false)}
          />


          {/* ปุ่ม Add ตรงกลางล่าง */}
          <View style={styles.addButtonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 100,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    // borderWidth: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    marginTop: 8,
    height: 50,
  },
  Description: {
    // borderWidth: 1,
    backgroundColor: "#F8FAFC",
    borderColor: '#aaa',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    marginTop: 8,
    height: 100,
  },
  timeBox: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    width: width / 2 - 50,
  },
  timeText: {
    fontSize: 18,
    color: 'black',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerColumn: {
    alignItems: 'center',
    width: '45%',
  },
  pickerInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    width: '100%',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
