// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');
const dayWidth = width / 7;

export default function HomeScreen({ navigation }) {
   const [markedDates, setMarkedDates] = useState({});

    useEffect(() => {
    const loadMarkedDates = async () => {
      try {
        const jsonDates = await AsyncStorage.getItem('taskDates');
        if (jsonDates) {
          const datesArray = JSON.parse(jsonDates); // เช่น ["2023-05-21", "2023-05-22"]
          // สร้าง object สำหรับ markedDates
          const marks = {};
          datesArray.forEach(date => {
            marks[date] = { marked: true, dotColor: 'blue' };
          });
          setMarkedDates(marks);
        }
      } catch (e) {
        console.log('Error loading marked dates:', e);
      }
    };

    loadMarkedDates();
  }, []);

  const renderDay = ({ date, state }) => {
    const isDisabled = state === 'disabled';
    const isToday = state === 'today';

    const handleDayPress = () => {
      const selectedDate = dayjs(date.dateString).format('YYYY-MM-DD');
      navigation.navigate('List-Task', { selectedDate });
    };

    const isMarked = markedDates[date.dateString]?.marked;

    return (
      <TouchableOpacity onPress={handleDayPress} style={[styles.dayContainer, { width: dayWidth }]}>
        <View style={styles.dayBox}>
          <Text
            style={[
              styles.dayText,
              isDisabled && styles.disabledText,
              isToday && styles.todayText,
            ]}
          >
            {date.day}
          </Text>
           {isMarked && <View style={styles.dot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ width: width, height: height / 2.2, paddingVertical: 10 }}>
        <Calendar
        //  markedDates={markedDates}
          hideDayNames={false}
          hideArrows={false}
          current={new Date().toISOString().split('T')[0]}
          dayComponent={renderDay}
          style={{ width: width }}
          theme={{ todayTextColor: '#00adf5' }}
        />
      </View>

      <View
        style={{
          width: width,
          height: height / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        <Text style={{ fontSize: 20, color: '#333' }}>Note</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dayBox: {
    justifyContent: 'center',
    alignItems: 'center',
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
  borderRadius: 3,
  backgroundColor: 'blue',
  marginTop: 2,
  alignSelf: 'center',
},

});
