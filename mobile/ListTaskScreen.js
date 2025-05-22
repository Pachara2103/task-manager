import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ListTaskScreen({ route, navigation }) {
  const { selectedDate } = route.params;
  const [tasks, setTasks] = useState([]);

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



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks for {selectedDate}</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.taskItem}>{item.time} : {item.name}</Text>
        )}
      />

      {/* ปุ่มเพิ่มงาน */}
      <TouchableOpacity style={styles.addButton} onPress={openAddTaskScreen}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom:25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
