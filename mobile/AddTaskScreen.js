import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
  Button, TouchableWithoutFeedback, Keyboard, Alert, Dimensions, Image, DeviceEventEmitter
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { AppContext } from './AppContext';
import dayjs from 'dayjs';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';



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
    likedByDate, setLikedByDate,

  } = useContext(AppContext);
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('');
  // const [onpress, setOnpress] = useState(false);

  const { taskToEdit, dateFromCalendar } = route.params || {};
  // console.log(' isFromCalendar', isFromCalendar);

  const [time, setTime] = useState({ hour: (new Date()).getHours().toString().padStart(2, '0'), min: (new Date()).getMinutes().toString().padStart(2, '0') });
  const [time2, setTime2] = useState(new Date());

  const [pickdate, setPickedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [deadlineDate, setDeadlineDate] = useState(new Date());
  const [isdeadlinedate, setIsDeadlineDate] = useState(false);

  useEffect(() => {
    if (category == 'homework') {
      // setIsDeadlineDate(true);
      console.log('homeworkkkkkkkkkkkkkkkkkkkkkk')
    }
  }, [category]);

  const ChangeDeadlineDate = (event, selectedDate) => {
    const currentDate = selectedDate || deadlineDate;
    // setIsDeadlineDate(false);
    setDeadlineDate(currentDate);
  };

  const ChangeDeadlineTime = (event, selectedTime) => {
    const currentTime = selectedTime || deadlineTime;
    // setIsDeadlineTime(false);
    setDeadlineTime(currentTime);
    console.log('time= ', deadlineTime);
  };


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
    // else {
    //   setTaskName('');
    //   setTime({ hour: '00', min: '00' });
    // }
  }, [taskToEdit]);

  // useEffect(() => {
  //   console.log('call handleConfirm  of dateFromCalendar');

  // }, [isFromCalendar]);

  const isFocused = useIsFocused();

  useEffect(() => {
    console.log('isfromc= ', isFromCalendar);
    if (isFromCalendar) {
      // setTaskName(taskToEdit.name)
      setTaskName('');
      const [year, month, day] = selectedDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);

      handleConfirm(dateObj);
      setPickedDate(dateObj);
      setFromCalendar(false);
    }else{
       setTaskName('');
    }

  }, [isFocused]);


  const handleAddTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('กรุณาใส่ชื่อ Task');
      return;
    }
    if (!category.trim()) {
      Alert.alert('กรุณาเลือก category');
      return;
    }
    const newTask = {
      name: taskName,
      time: `${time.hour}:${time.min}`,
      date: selectedDate,
      category: category,
      ...(category === 'homework' && { deadline: deadlineDate }) 
    };


    const key = `tasks-${selectedDate}`;

    try {
      const saved = await AsyncStorage.getItem(key);
      let tasks = saved ? JSON.parse(saved) : [];

      if (taskToEdit) {
        tasks = tasks.filter(
          (t) => !(t.name === taskToEdit.name && t.time === taskToEdit.time && t.category === taskToEdit.category)
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
              t.date === taskToEdit.date &&
              t.category === taskToEdit.category
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

      ////// for allFavTask
      if (likedByDate[selectedDate]) {
        try {
          const favJson = await AsyncStorage.getItem('allFavTasks');
          let favList = favJson ? JSON.parse(favJson) : [];

          if (taskToEdit) {
            favList = favList.filter(
              (t) =>
                !(
                  t.name === taskToEdit.name &&
                  t.time === taskToEdit.time &&
                  t.date === taskToEdit.date &&
                  t.category === taskToEdit.category
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

          await AsyncStorage.setItem('allFavTasks', JSON.stringify(favList));

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
      // if (isFromCalendar) {
      //   navigation.navigate('HOME', {
      //     isFromCalendar: true,
      //     // dateBackFromAdd: dateFromCalendar,
      //   });
      // }

    } catch (e) {
      console.log("Error saving task:", e);
    }


  };
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



  return (

    <View style={{
      flex: 1, flexDirection: 'row',
      justifyContent: 'center',
      // backgroundColor: 'white',
    }}>


      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}

      <View style={{
        width: width,
        height: 160,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        // backgroundColor: '#DBE2EF',
        backgroundColor: '#DBE2EF',
        position: 'absolute',
        top: 0
      }}>
        <View style={{ justifyContent: 'flex-start', marginTop: 80, height: 40, width: width }}>
          <Text style={{ textAlign: 'left', fontSize: 30, fontWeight: 'bold', marginLeft: 10 }}>
            ADD NEW TASK
          </Text>

        </View>

        <View style={{ height: 30, width: width - 20, justifyContent: 'flex-start', marginLeft: 10 }}>
          <Text style={{ fontSize: 15 }}>
            {dayjs().format('dddd')},  {dayjs().date()} {months[dayjs().month()]} {dayjs().year()}
          </Text>

        </View>

      </View>

      <View style={{
        backgroundColor: 'white',
        // borderBottomLeftRadius: 40,
        // borderBottomRightRadius: 40,
        // width: width,
        // height: 500,
        flex: 1,

        flexDirection: 'row',
        marginTop: 160,

      }}>


        <View style={{
          // backgroundColor: 'green',
          width: width - 20,
          height: 100,
          marginLeft: 20,
          marginTop: 40
          // position: 'absolute',
          // top: 0,
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
          // backgroundColor: 'red',
          width: width - 20,
          height: 150,
          // marginLeft: -10,
          position: 'absolute',
          top: 140,
          marginLeft: 20,


        }}>
          <Text style={styles.label}>Category</Text>

          <View style={{
            // backgroundColor: 'pink',
            width: width - 20,
            height: 100,
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: 15,
            rowGap: 5,
            marginLeft: 10
          }}>



            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, height: 30, width: 100 }}>

              <TouchableOpacity
                onPress={() => {
                  setCategory(category == 'exercise' ? '' : 'exercise')
                  console.log(category == 'exercise' ? 'cancel' : 'exercise')
                }}>

                <View style={{ backgroundColor: '#E8F9FF', width: 30, borderRadius: 20 }}>
                  <Image
                    source={
                      category == 'exercise'
                        ? require('./Image/afterworkout.png')
                        : require('./Image/beforeworkout.png')
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </View>

              </TouchableOpacity>

              <Text style={{ position: 'absolute', left: 35, top: 5, opacity: category == 'exercise' ? 1 : 0.2 }}>
                Exercise
              </Text>

            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, height: 30, width: 100 }}>

              <TouchableOpacity
                onPress={() => {
                  setCategory(category == 'dinner' ? '' : 'dinner')
                  console.log(category == 'dinner' ? 'cancel' : 'dinner')
                }}>

                <View style={{ backgroundColor: '#E8F9FF', width: 30, borderRadius: 20 }}>
                  <Image
                    source={
                      category == 'dinner'
                        ? require('./Image/Afood.png')
                        : require('./Image/Bfood.png')
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </View>

              </TouchableOpacity>

              <Text style={{ position: 'absolute', left: 35, top: 5, opacity: category == 'dinner' ? 1 : 0.2 }}>
                Dinner
              </Text>

            </View>
            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, height: 30, width: 100 }}>

              <TouchableOpacity
                onPress={() => {
                  setCategory(category == 'book' ? '' : 'book')
                  console.log(category == 'book' ? 'cancel' : 'book')
                }}>

                <View style={{ backgroundColor: '#E8F9FF', width: 30, borderRadius: 20 }}>
                  <Image
                    source={
                      category == 'book'
                        ? require('./Image/Abook.png')
                        : require('./Image/Bbook.png')
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </View>

              </TouchableOpacity>

              <Text style={{ position: 'absolute', left: 35, top: 5, opacity: category == 'book' ? 1 : 0.2 }}>
                Reading
              </Text>

            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, height: 30, width: 100 }}>

              <TouchableOpacity
                onPress={() => {
                  setCategory(category == 'homework' ? '' : 'homework')
                  console.log(category == 'homework' ? 'cancel' : 'homework')
                }}>

                <View style={{ backgroundColor: '#E8F9FF', width: 30, borderRadius: 20 }}>
                  <Image
                    source={
                      category == 'homework'
                        ? require('./Image/Ahomework.png')
                        : require('./Image/Bhomework.png')
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </View>

              </TouchableOpacity>

              <Text style={{ position: 'absolute', left: 35, top: 5, opacity: category == 'homework' ? 1 : 0.2 }}>
                Homework
              </Text>

            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, height: 30, width: 100 }}>

              <TouchableOpacity
                onPress={() => {
                  setCategory(category == 'meeting' ? '' : 'meeting')
                  console.log(category == 'meeting' ? 'cancel' : 'meeting')
                }}>

                <View style={{ backgroundColor: '#E8F9FF', width: 30, borderRadius: 20 }}>
                  <Image
                    source={
                      category == 'meeting'
                        ? require('./Image/Ameeting.png')
                        : require('./Image/Bmeeting.png')
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </View>

              </TouchableOpacity>

              <Text style={{ position: 'absolute', left: 35, top: 5, opacity: category == 'meeting' ? 1 : 0.2 }}>
                Meeting
              </Text>

            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, height: 30, width: 100 }}>

              <TouchableOpacity
                onPress={() => {
                  setCategory(category == 'reminder' ? '' : 'reminder')
                  // console.log(category == 'book' ? 'cancel' : 'book')
                }}>

                <View style={{ backgroundColor: '#E8F9FF', width: 30, borderRadius: 20 }}>
                  <Image
                    source={
                      category == 'reminder'
                        ? require('./Image/Areminder.png')
                        : require('./Image/Breminder.png')
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </View>

              </TouchableOpacity>

              <Text style={{ position: 'absolute', left: 35, top: 5, opacity: category == 'reminder' ? 1 : 0.2 }}>
                Reminder
              </Text>

            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, height: 30, width: 100 }}>

              <TouchableOpacity
                onPress={() => {
                  setCategory(category == 'sleep' ? '' : 'sleep')
                  // console.log(category == 'book' ? 'cancel' : 'book')
                }}>

                <View style={{ backgroundColor: '#E8F9FF', width: 30, borderRadius: 20 }}>
                  <Image
                    source={
                      category == 'sleep'
                        ? require('./Image/Asleep.png')
                        : require('./Image/Bsleep.png')
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </View>

              </TouchableOpacity>

              <Text style={{ position: 'absolute', left: 35, top: 5, opacity: category == 'sleep' ? 1 : 0.2 }}>
                Sleep
              </Text>

            </View>
          </View>
        </View>

        <View style={{
          // backgroundColor: 'green',
          width: width - 20,
          height: 100,
          // marginLeft: -10,
          flexDirection: 'row',
          position: 'absolute',
          top: 290,
          marginLeft: 20

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

            <Image
              source={require('./Image/clock.png')} // ใส่ path ไอคอนของคุณ
              style={{ width: 20, height: 20, position: 'absolute', top: 35 }}
            />

            <View style={{ position: 'absolute', top: 25, left: 15 }}>
              <DateTimePicker
                value={time2}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTime2(selectedDate); // ต้องเซ็ตค่าด้วย Date ที่ได้

                    const mm = selectedDate.getMinutes().toString().padStart(2, '0');
                    const hh = selectedDate.getHours().toString().padStart(2, '0');

                    console.log("confirm Time", hh + ":" + mm);

                    setTime({ hour: hh, min: mm });
                    // setTimePickerVisible(false);
                  }
                }}
              />
            </View>
          </View>

        </View>



        <View style={{ alignItems: 'center', position: 'absolute', bottom: 125, right: 140 }}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {category === 'homework' &&
          <View style={{ position: 'absolute', bottom: 200, left: 105 }}>

            <Text style={{
              position: 'absolute', bottom: 50, left: 35, fontSize: 20
            }}>   Deadline</Text>

            {/* <TouchableOpacity onPress={() => setIsDeadlineDate(true)} >

              <Text style={{ fontSize: 18 }}>
                {dayjs(deadlineDate).format('DD MMM YYYY')} 
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={{
              flexDirection: 'row',
              // padding: 10,
              backgroundColor: "#F8FAFC",
              borderRadius: 4,
              paddingVertical: 12,
              paddingHorizontal: 20,
              // alignSelf: 'flex-start',
              width: width / 2 - 25,
            }} onPress={() => setIsDeadlineDate(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('./Image/calendar.png')} // ใส่ path ไอคอนของคุณ
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                <Text style={styles.timeText}>{dayjs(deadlineDate).format('DD MMM YYYY')}</Text>


              </View>
            </TouchableOpacity>


            <View style={{ backgroundColor: 'pink' }}>

              <DateTimePickerModal
                isVisible={isdeadlinedate}
                mode="date"
                date={deadlineDate}
                onConfirm={(selectedDate) => {
                  if (selectedDate) {
                    setDeadlineDate(selectedDate);
                    setIsDeadlineDate(false);
                    console.log("confirm deadline = ", dayjs(selectedDate).format('DD MMM YYYY'));
                  }
                }}
                onCancel={() => setIsDeadlineDate(false)}
                locale="en-GB" // <- ป้องกันไม่ให้แสดง BE
                display="inline" // หรือ "inline", "default", แล้วแต่ต้องการ
                themeVariant="light" // เพื่อให้ text แสดงเป็นสีดำ:
              />
            </View>



          </View>
        }


      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    // marginTop:200
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
