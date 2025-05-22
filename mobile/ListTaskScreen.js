import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TouchableWithoutFeedback,Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


function formatDate(dateString) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateObj = new Date(dateString);
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
}
const { width, height } = Dimensions.get('window');


export default function ListTaskScreen({ route, navigation }) {
  const { selectedDate } = route.params;
  const [tasks, setTasks] = useState([]);

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);



  const handleAddTask = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const openAddTaskScreen = () => {
    navigation.navigate('Add Task', {
      selectedDate: selectedDate,
      onAddTask: handleAddTask,
    });
  };

  const sortTasksByTime = (tasksArray) => {
    return tasksArray.sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await AsyncStorage.getItem(`tasks-${selectedDate}`);
        if (saved) {
          const parsedTasks = JSON.parse(saved);
          setTasks(sortTasksByTime(parsedTasks));
        }
      } catch (e) {
        console.log("Error loading tasks:", e);
      }
    };
    loadTasks();
  }, [selectedDate]);

  // useEffect(() => {
  //   const saveAndSortTask = async () => {
  //     if (route.params?.newTask) {
  //       try {
  //         const key = `tasks-${selectedDate}`;
  //         const saved = await AsyncStorage.getItem(key);
  //         const parsed = saved ? JSON.parse(saved) : [];

  //         const updatedTasks = [...parsed, route.params.newTask];

  //         const sortedTasks = sortTasksByTime(updatedTasks);
  //         setTasks(sortedTasks);

  //         await AsyncStorage.setItem(key, JSON.stringify(sortedTasks));
  //       } catch (e) {
  //         console.log("Error saving new task:", e);
  //       }
  //     }
  //   };

  //   saveAndSortTask();
  // }, [route.params?.newTask]);
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
      <Text style={styles.title}>{formatDate(selectedDate)}</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        // renderItem={({ item }) => (
        //   <Text style={styles.taskItem}>{item.time} : {item.name}</Text>
        // )}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => {
            setSelectedTaskIndex(index);
            setShowModal(true);
          }}>
            <Text style={styles.taskItem}>{item.time} : {item.name}</Text>
          </TouchableOpacity>
        )}

      />

      {showModal && selectedTaskIndex !== null && (
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>

          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
             <View style={[styles.modalBox, { marginBottom:50}]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'orange' }]}
                onPress={() => {
                  setShowModal(false);
                  const task = tasks[selectedTaskIndex];
                  navigation.navigate('Add Task', {
                    selectedDate,
                    taskToEdit: task,
                    taskIndex: selectedTaskIndex,
                    onAddTask: handleAddTask,
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
                  setShowModal(false);
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
  style={[showModal ? styles.disabledButton : styles.addButton]}
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

});
