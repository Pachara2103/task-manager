import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, DeviceEventEmitter } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

export default function AllTasksScreen({ navigation }) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayColour = [
        '#FF0B55', // Sunday 
        '#F3C623', // Monday 
        '#FF90BB', // Tuesday  
        '#27ae60', // Wednesday
        '#FF9B45', // Thursday
        '#4ED7F1', // Friday
        '#CB9DF0', // Saturday
    ];
    const {
        allTasks, setAllTasks,
    } = useContext(AppContext);
    const isFocused = useIsFocused();
    // console.log('all task= : ', allTasks);

    const handleShowAllTasks = async () => {
        // await AsyncStorage.setItem('allTasks', JSON.stringify([]));  //reset all tasks
        try {
            const savedAll = await AsyncStorage.getItem('allTasks');
            const allTasks = savedAll ? JSON.parse(savedAll) : [];

            const groupedTasks = allTasks.reduce((acc, task) => {
                if (!acc[task.date]) {
                    acc[task.date] = [];
                }
                acc[task.date].push(task);
                return acc;
            }, {});

            const allTasksList = Object.keys(groupedTasks)
                .sort((a, b) => dayjs(a).unix() - dayjs(b).unix()) // เรียงวันที่ (ถ้าต้องการ)
                .map(date => ({
                    date,
                    tasks: groupedTasks[date].sort((a, b) => a.time.localeCompare(b.time))
                }));

            setAllTasks(allTasksList);
            // console.log('all Task = ', allTasks);

        } catch (e) {
            console.log('Error loading all tasks:', e);
        }
    };

    useEffect(() => {
        if (isFocused) {
            handleShowAllTasks();
            // console.log('loading all task screen');

        }
    }, [isFocused]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('reloadAllTasksScreen', handleShowAllTasks);
        console.log('reloadAllTasksScreen');
        return () => {
            subscription.remove(); // cleanup เวลา component ถูก destroy
        };
    }, []);

    const categoryImages = {
        exercise: require('./Image/category/exercise.png'),
        dinner: require('./Image/category/eating.png'),
        book: require('./Image/category/book.png'),
        homework: require('./Image/category/homework.png'),
        meeting: require('./Image/category/meeting.png'),
        reminder: require('./Image/category/reminder.png'),
        sleep: require('./Image/category/sleep.png'),
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

            <View style={{
                width: width,
                height: 160,
                flexDirection: 'column',
                backgroundColor: '#DBE2EF',

            }}>

                <View style={{ justifyContent: 'flex-start', marginTop: 80, height: 40, width: width }}>
                    <Text style={{ textAlign: 'left', fontSize: 30, fontWeight: 'bold', marginLeft: 10 }}>
                        ALL TASK
                    </Text>

                </View>

                <View style={{ height: 30, width: width - 20, justifyContent: 'flex-start', marginLeft: 10 }}>
                    <Text style={{ fontSize: 15 }}>
                        {dayjs().format('dddd')},  {dayjs().date()} {months[dayjs().month()]} {dayjs().year()}
                    </Text>


                </View>

            </View>

            <View style={{
                width: width,
                height: 590,
                // backgroundColor: 'pink'
            }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {allTasks.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ fontSize: 30, color: 'gray' }}>ไม่มีงานในขณะนี้</Text>
                        </View>
                    ) : (
                        allTasks.map((group, index) => {
                            const isPast = dayjs(group.date, 'YYYY-MM-DD').isBefore(dayjs().format('YYYY-MM-DD'), 'day');

                            return (
                                <View key={index} style={[styles.dayContainer, isPast && { opacity: 0.5 }]}>
                                    {/* วันที่ */}
                                    <Text style={styles.dateText}>
                                        <Text style={{ color: dayColour[dayjs(group.date).day()], opacity: 0.5 }}>━━━━━  </Text>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{dayjs(group.date).date()} {months[dayjs(group.date).month()]}</Text>
                                        <Text style={{ color: dayColour[dayjs(group.date).day()], opacity: 0.5 }}> ━━━━━</Text>
                                    </Text>

                                    {/* วันที่ย่อ */}
                                    <Text style={{
                                        opacity: 0.6,
                                        fontSize: 12,
                                        color: dayColour[dayjs(group.date).day()],
                                        fontWeight: 'bold',
                                        position: 'absolute',
                                        top: 29,
                                        left: width / 2 - 25
                                    }}>
                                        {dayjs(group.date).format('ddd')}
                                    </Text>

                                    {/* งานแต่ละชิ้น */}
                                    {group.tasks.map((task, idx) => {
                                        const taskDateTime = dayjs(`${group.date} ${task.time}`, 'YYYY-MM-DD HH:mm');
                                        const isTimePast = taskDateTime.isBefore(dayjs());

                                        return (
                                            <View key={idx} style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginBottom: 8,
                                                opacity: isTimePast ? 0.5 : 1,
                                                // backgroundColor: 're/d',
                                                // width: 300
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, }}>
                                                    <Image
                                                        source={require('./Image/clock.png')}
                                                        style={{ width: 15, height: 15 }}
                                                    />
                                                    <Text style={styles.timeText}>
                                                        {(task.time || '00:00').replace(':', '.')}
                                                    </Text>
                                                </View>

                                                <View style={{
                                                    flex: 1,
                                                    backgroundColor: '#fbfcfc',
                                                    padding: 10,
                                                    borderRadius: 15,
                                                    shadowColor: '#000',
                                                    shadowOpacity: 0.1,
                                                    shadowRadius: 4,
                                                    elevation: 2,
                                                    alignItems: 'center',
                                                    flexDirection: 'row'
                                                }}>
                                                    <Text style={{ fontSize: 14 }}>{task.name}</Text>
                                                    {task.category && categoryImages[task.category] && (
                                                        <Image
                                                            source={categoryImages[task.category]}
                                                            style={{ width: 35, height: 35, position: 'absolute', right: 5 }}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            );
                        })
                    )}
                </ScrollView>



            </View>
        </View >
    );
}


const styles = StyleSheet.create({
    scrollContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
        paddingTop: 20,
        // backgroundColor: '#EFF3EA',
        // borderRadius: 20,
        // overflow: 'hidden',

    },
    dayContainer: {
        // marginBottom: 20,
        // paddingHorizontal: 16,
        // paddingVertical: 10,
        // // backgroundColor: '#f5f5f5',
        // // backgroundColor: 'red',
        // borderRadius: 10,
        alignItems: 'center',
        marginVertical: 8,
    },
    dateText: {
        textAlign: 'center',
        fontSize: 15,
        // fontWeight: 'bold',
        marginBottom: 10,
    },

    timeText: {
        width: 60,
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
        marginLeft: 5
    },



});