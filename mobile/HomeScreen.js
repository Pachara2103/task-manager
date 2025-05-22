// HomeScreen.js
import React from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';

const { width, height } = Dimensions.get('window');
const dayWidth = width / 7;

export default function HomeScreen({ navigation }) {
  const renderDay = ({ date, state }) => {
    const isDisabled = state === 'disabled';
    const isToday = state === 'today';

    const handleDayPress = () => {
      const selectedDate = dayjs(date.dateString).format('YYYY-MM-DD');
      navigation.navigate('List-Task', { selectedDate });
    };

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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ width: width, height: height / 2.2, paddingVertical: 10 }}>
        <Calendar
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
});
