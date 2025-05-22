import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import axios from 'axios';


const BASE_URL = 'http://192.168.43.9:5000'; // เปลี่ยน IP ให้ตรงกับคอม

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error('โหลดงานไม่สำเร็จ', err);
    }
  };

  const addTask = async () => {
    if (!newTitle || !newDueDate) return alert('กรุณากรอกชื่องานและวันที่');
    try {
      await axios.post(`${BASE_URL}/tasks`, {
        title: newTitle,
        dueDate: newDueDate,
      });
      setNewTitle('');
      setNewDueDate('');
      fetchTasks();
    } catch (err) {
      console.error('เพิ่มงานไม่สำเร็จ', err);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await axios.put(`${BASE_URL}/tasks/${id}`, {
        completed: !completed,
      });
      fetchTasks();
    } catch (err) {
      console.error('เปลี่ยนสถานะไม่สำเร็จ', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('ลบงานไม่สำเร็จ', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        onPress={() => toggleComplete(item.id, item.completed)}
        style={styles.checkbox}
      >
        <Text style={styles.checkboxText}>{item.completed ? '✅' : '⬜'}</Text>
      </TouchableOpacity>
      <Text style={item.completed ? styles.completed : null}>
        {item.title} (หมดเขต: {item.dueDate})
      </Text>
      <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteBtn}>
        <Text style={{ color: 'white' }}>ลบ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Task Manager</Text>

      <TextInput
        placeholder="ชื่องาน"
        value={newTitle}
        onChangeText={setNewTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="วันที่ (YYYY-MM-DD)"
        value={newDueDate}
        onChangeText={setNewDueDate}
        style={styles.input}
      />
      <Button title="เพิ่มงาน" onPress={addTask} />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: Platform.OS === 'android' ? 50 : 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
  },
  completed: {
    textDecorationLine: 'line-through',
  },
  deleteBtn: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 20,
  },
});
