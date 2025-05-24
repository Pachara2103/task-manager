import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TouchableWithoutFeedback, Dimensions, DeviceEventEmitter, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';





function formatDate(dateString) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateObj = new Date(dateString);
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
}

const { width, height } = Dimensions.get('window');


export default function ListTaskScreen({ route, navigation }) {

  // useEffect(() => {
  //   const subscription = DeviceEventEmitter.addListener('toListTaskScreen', ListTaskScreen);
  //   return () => {
  //     subscription.remove(); // cleanup เวลา component ถูก destroy
  //   };
  // }, []);
  const isFocused = useIsFocused(); //useIsFocused ช่วยให้โหลดใหม่เมื่อกลับมาจากหน้าอื่น


  const { ShowFav,
    handleShowAllTasks,
    isShowAllList,
    isShowFav,
    isLiked,
    markedDates,
    isShowListTask,
    setShowListTask,
    setIsLiked,

    selectedDate,
    setDate,
    selectedTaskIndex,
    setSelectedTaskIndex,

    tasks,
    setTasks,

  } = useContext(AppContext);


  const [showModal, setShowModal] = useState(false);

  const toggleHeart = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);

    if (newLiked) {
      try {
        // โหลด tasks ของวันนั้น
        const tasksJson = await AsyncStorage.getItem(`tasks-${selectedDate}`);
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];

        if (tasks.length > 0) {
          const favJson = await AsyncStorage.getItem('allFavTask');
          let favList = favJson ? JSON.parse(favJson) : [];

          // แปลง tasks ให้เป็น flat array ที่เก็บ name, time, date
          const tasksWithDate = tasks.map(t => ({
            name: t.name,
            time: t.time,
            date: selectedDate
          }));

          // กรองของเดิมที่ซ้ำวันเดียวกันออก
          favList = favList.filter(t => t.date !== selectedDate);

          favList = favList.concat(tasksWithDate);

          await AsyncStorage.setItem('allFavTask', JSON.stringify(favList));
        }
      } catch (e) {
        console.log('Error saving to allFavTask:', e);
      }

      if (isShowFav) {
        DeviceEventEmitter.emit('reloadAllFavTasks');
      }
    } else {
      // ถ้า unlike ให้ลบ task ทั้งหมดของวันนั้นออกจาก allFavTask
      try {
        const favJson = await AsyncStorage.getItem('allFavTask');
        let favList = favJson ? JSON.parse(favJson) : [];

        favList = favList.filter(t => t.date !== selectedDate);

        await AsyncStorage.setItem('allFavTask', JSON.stringify(favList));
      } catch (e) {
        console.log('Error removing from allFavTask:', e);
      }

      if (isShowFav) {
        DeviceEventEmitter.emit('reloadAllFavTasks');
      }
    }
  };

  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        const favJson = await AsyncStorage.getItem('allFavTask');
        const favList = favJson ? JSON.parse(favJson) : [];

        // ตรวจสอบว่ามี selectedDate ใน allFavTask หรือไม่
        const isFav = favList.some(item => item.date === selectedDate);
        setIsLiked(isFav);
      } catch (e) {
        console.log('Error loading like status:', e);
      }
    };

    loadLikeStatus();
  }, [selectedDate]);


  const handleAddTask = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const openAddTaskScreen = () => {
    navigation.navigate('Add', {
      // selectedDate: selectedDate,
      // isLiked: isLiked,
      // isShowAllList: isShowAllList,
      // isShowFav: isShowFav,
      //   onAddTask: handleAddTask,
    });
  };

  const sortTasksByTime = (tasksArray) => {
    return tasksArray.sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });
  };

  const loadTasks = async () => {
    try {
      const saved = await AsyncStorage.getItem(`tasks-${selectedDate}`);
      if (saved) {
        const parsedTasks = JSON.parse(saved);
        setTasks(sortTasksByTime(parsedTasks));
      }
      console.log("loading tasksssssssssss");
    } catch (e) {
      console.log("Error loading tasks:", e);
    }
  };

  // โหลดซ้ำเมื่อกลับมาหน้านี้ (Focused)
  useEffect(() => {
    if (isFocused) {
      loadTasks();
    }
  }, [isFocused]);

  // โหลดเมื่อ selectedDate เปลี่ยน
  // useEffect(() => {
  //   loadTasks();
  // }, [selectedDate]);

  useEffect(() => {
    if (route.params?.newTask) {
      const newTasks = [...tasks, route.params.newTask];

      const sortedTasks = sortTasksByTime(newTasks); // ✅ เรียงเวลาทันที
      setTasks(sortedTasks);

      // บันทึก tasks ที่เรียงแล้วลง AsyncStorage
      AsyncStorage.setItem(`tasks-${selectedDate}`, JSON.stringify(sortedTasks))
        .catch(e => console.log("Error saving tasks:", e));
    }
  }, [route.params?.newTask]);

  // บันทึกทุกครั้งที่ tasks เปลี่ยน
  useEffect(() => {
    AsyncStorage.setItem(`tasks-${selectedDate}`, JSON.stringify(tasks))
      .catch(e => console.log("Error saving tasks:", e));
  }, [tasks]);

  //edit to addtask
  useEffect(() => {
    if (route.params?.taskToEdit) {
      setTaskName(route.params.taskToEdit.name);
      setTempHour(route.params.taskToEdit.time.split(':')[0]);
      setTempMin(route.params.taskToEdit.time.split(':')[1]);
    }
  }, []);


  return (
    <View style={styles.container}>
      <View style={{
        position: 'absolute',
        top: 0,
        width: width,
        height: 70,
        backgroundColor: 'orange',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={styles.ImageContainer}>
          <Text style={[styles.title, { marginTop: 10, marginRight: 10, }]}>{formatDate(selectedDate)}</Text>
        </View>

        <TouchableOpacity onPress={toggleHeart} >
          <Image
            source={
              isLiked
                ? require('./Image/fullheart.png')
                : require('./Image/noheart.png')
            }
            style={{ width: 40, height: 40, marginBottom: 5 }}
          />
        </TouchableOpacity>

      </View>

      <View style={{ position: 'absolute', top: 150, flexDirection: 'column', width: width, height: height / 2, backgroundColor: 'pink' }}>

        <FlatList
          data={tasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => {
              setSelectedTaskIndex(index);
              setShowModal(true);
            }}>
              <Text style={styles.taskItem}>{item.time} : {item.name}</Text>
            </TouchableOpacity>
          )}

        />
      </View>

      {showModal && selectedTaskIndex !== null && (
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>

          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalBox, { marginBottom: 50 }]}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'orange' }]}
                  onPress={() => {
                    setShowModal(false);
                    const task = tasks[selectedTaskIndex];
                    navigation.navigate('Add', {
                      taskToEdit: task,
                      // taskIndex: selectedTaskIndex,
                      // isLiked: isLiked,
                      // isShowAllList: isShowAllList,
                      // isShowFav: isShowFav,
                      // onAddTask: handleAddTask,
                    });
                  }}
                >
                  <Text style={styles.modalButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'red', marginTop: 10 }]}
                  onPress={async () => {
                    const newTasks = tasks.filter((_, i) => i !== selectedTaskIndex);
                    setTasks(newTasks);
                    await AsyncStorage.setItem(`tasks-${selectedDate}`, JSON.stringify(newTasks));

                    // ลบ task ใน allTasks
                    const savedAll = await AsyncStorage.getItem('allTasks');
                    let allTasks = savedAll ? JSON.parse(savedAll) : [];

                    // task ที่จะลบ (อิงจาก selectedTaskIndex)
                    const taskToDelete = tasks[selectedTaskIndex];

                    // กรอง allTasks ให้ลบ task นี้ออก
                    allTasks = allTasks.filter(t =>
                      !(t.name === taskToDelete.name &&
                        t.time === taskToDelete.time &&
                        t.date === selectedDate)
                    );

                    await AsyncStorage.setItem('allTasks', JSON.stringify(allTasks));

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

                    setShowModal(false);
                    // console.log(isShowAllList);

                    if (isShowAllList) {
                      DeviceEventEmitter.emit('reloadAllTasks');
                    }
                    else if (isShowFav) {
                      DeviceEventEmitter.emit('reloadAllFavTasks');
                    }

                  }}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>

              </View>
            </TouchableWithoutFeedback>
          </View>

        </TouchableWithoutFeedback >

      )
      }


      <TouchableOpacity
        style={[showModal ? styles.disabledButton : styles.addButton, { position: 'absolute', bottom: 15 }]}
        onPress={openAddTaskScreen}
        disabled={showModal}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskItem: {
    fontSize: 18,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 25,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // pointerEvents: 'auto',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '70%',
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

});
