// HomeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, DeviceEventEmitter } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';

import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';



const { width, height } = Dimensions.get('window');
const dayWidth = width / 7;

export default function HomeScreen({ navigation }) {
  const {
    markedDates,
    isShowListTask,
    setShowListTask,
    selectedDate,
     setMarkedDates,
    setDate,
  } = useContext(AppContext);

  
  const loadMarkedDates = async () => {
    try {
      const jsonDatesMap = await AsyncStorage.getItem('taskDatesMap');
      const datesMap = jsonDatesMap ? JSON.parse(jsonDatesMap) : {};

      const updatedMarks = {};
      const colors = ['pink', 'orange', 'red', 'green', 'purple'];

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

  const isFocused = useIsFocused(); //useIsFocused ช่วยให้โหลดใหม่เมื่อกลับมาจากหน้าอื่น
  useEffect(() => {
    if (isFocused) {
      loadMarkedDates();
    }
  }, [isFocused]);



  const renderDay = ({ date, state }) => {
    const isDisabled = state === 'disabled';
    const isToday = state === 'today';

    const handleDayPress = () => {
      const Date = dayjs(date.dateString).format('YYYY-MM-DD');
      setDate(Date);
      setShowListTask(true);
      navigation.navigate('ListTask', {
        //   onAddTask: handleAddTask,
      });
    };

    const mark = markedDates[date.dateString];
    const isMarked = mark?.marked;
    const dotColor = mark?.dotColor || 'blue';

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
          <View style={[styles.dot, isDisabled && styles.dotDisable, { backgroundColor: isMarked ? dotColor : 'transparent' }]} />

        </View>
      </TouchableOpacity>
    );
  };

  return (

    <View style={{ height: height - 200, backgroundColor: 'white', flexDirection: 'column' }}>
      <View style={{
        width: width,
        height: 100,
        backgroundColor: '#DBE2EF',
      }}>
        <Text style={{
          textAlign: 'center',
          marginTop: 62.5,
          fontSize: 18,
        }}>CALENDAR
        </Text>
      </View>

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

        renderHeader={(date) => {
          const month = dayjs(date).format('MMMM YYYY');
          return (
            <View style={{
              paddingBottom: 10,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <View style={styles.monthDivider} />
              <Text style={[
                styles.monthHeader, {
                  position: 'absolute',
                  left: 132.5,
                  top: -25,

                }]}>{month}</Text>
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
    </View >
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  ImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',

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
  monthDivider: {
    height: 2,
    width: width - 40,
    backgroundColor: '#ccc',
    marginTop: -65,
    marginLeft: -5,
    marginHorizontal: 20,
    opacity: 0.2,

  },



});
