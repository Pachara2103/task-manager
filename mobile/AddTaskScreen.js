import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
  Button, TouchableWithoutFeedback, Keyboard, Alert, DeviceEventEmitter
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { AppContext } from './AppContext';




export default function AddTaskScreen({ route, navigation }) {


  const { ShowFav,
    handleShowAllTasks,
    isShowAllList,
    isShowFav,
    markedDates,
    isShowListTask,
    isLiked,
    setShowListTask,

    selectedDate,
    setDate,
    selectedTaskIndex,
    setSelectedTaskIndex,

    tasks,
    setTasks,

  } = useContext(AppContext);

  const { taskToEdit } = route.params || {};
  const [taskName, setTaskName] = useState('');
  const [time, setTime] = useState({ hour: '00', min: '00' });
  const [modalVisible, setModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState('00');
  const [tempMin, setTempMin] = useState('00');

  const openTimePicker = () => {
    setTempHour(time.hour);
    setTempMin(time.min);
    setModalVisible(true);
  };

  const confirmTime = () => {
    const h = parseInt(tempHour, 10);
    const m = parseInt(tempMin, 10);

    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      Alert.alert('Invalid Time', 'Time is incorrect. Please enter again.');
      return; // modal ค้างไว้ไม่ปิด ให้แก้ไขใหม่
    }

    setTime({
      hour: h.toString().padStart(2, '0'),
      min: m.toString().padStart(2, '0'),
    });
    setModalVisible(false);
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

  const cancelTime = () => { setModalVisible(false); };

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
      let tasks = saved ? JSON.parse(saved) : [];

      // ถ้าเป็น edit → ลบ task เดิม
      if (taskToEdit) {
        tasks = tasks.filter(
          (t) => !(t.name === taskToEdit.name && t.time === taskToEdit.time)
        );
      }
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
          const colors = ['pink', 'orange', 'red', 'green', 'purple'];
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




      // Navigate back to the task list
      navigation.navigate('ListTask', {});


    } catch (e) {
      console.log("Error saving task:", e);
    }

    // if (isShowAllList) {
    //   DeviceEventEmitter.emit('reloadAllTasks');
    // }
    // if (isShowFav) {
    //   DeviceEventEmitter.emit('reloadAllFavTasks');
    // }
    // console.log('all Task after add= ', allTasks);

  };



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.dateText}>Date: {selectedDate}</Text>

        <Text style={styles.label}>Task:</Text>
        <TextInput
          style={styles.input}
          placeholder="ชื่องาน"
          value={taskName}
          onChangeText={setTaskName}
        />

        <Text style={styles.label}>Time:</Text>
        <TouchableOpacity style={styles.timeBox} onPress={openTimePicker}>
          <Text style={styles.timeText}>{time.hour}:{time.min}</Text>
        </TouchableOpacity>

        {/* Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelTime}
        >
          <TouchableWithoutFeedback onPress={cancelTime}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>

                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>เลือกเวลา</Text>

                  <View style={styles.pickerRow}>
                    <View style={styles.pickerColumn}>
                      <Text>ชั่วโมง</Text>
                      <TextInput
                        style={styles.pickerInput}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={tempHour}
                        onFocus={() => {
                          if (tempHour === '00') setTempHour('');
                        }}
                        onChangeText={text => {
                          // ตัดเฉพาะเลข
                          let val = text.replace(/[^0-9]/g, '');
                          // ไม่เติม 0 ให้อัตโนมัติ ให้เก็บตาม input เลย
                          setTempHour(val);
                        }}
                      />
                    </View>

                    <View style={styles.pickerColumn}>
                      <Text>นาที</Text>
                      <TextInput
                        style={styles.pickerInput}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={tempMin}
                        onFocus={() => {
                          if (tempMin === '00') setTempMin('');
                        }}
                        onChangeText={text => {
                          let val = text.replace(/[^0-9]/g, '');
                          setTempMin(val);
                        }}
                      />
                    </View>
                  </View>


                  <View style={{ marginTop: 20 }}>
                    <Button title="OK" onPress={confirmTime} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* ปุ่ม Add ตรงกลางล่าง */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  timeBox: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 18,
    color: '#007AFF',
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
