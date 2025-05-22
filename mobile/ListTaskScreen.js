import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function ListTaskScreen({ route, navigation }) {
  const { selectedDate } = route.params;

//   const handleAddTask = () => {
//     Alert.alert("addtask");
//     navigation.navigate('Add Task', { selectedDate }); // ส่งค่าไป
//   };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks for {selectedDate}</Text>

      {/* <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    top: 20,
    right: 10,
    padding: 10,
  },
  addButtonText: {
    fontSize: 28,
    color: '#007AFF',
  },
});
