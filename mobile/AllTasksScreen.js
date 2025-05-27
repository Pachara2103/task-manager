import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, DeviceEventEmitter } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';
// import { opacity } from 'react-native-reanimated/lib/typescript/Colors';


// function formatDate(dateString) {
//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const dateObj = new Date(dateString);
//     const day = dateObj.getDate();
//     const month = months[dateObj.getMonth()];
//     const year = dateObj.getFullYear();
//     return `${day} ${month} ${year}`;
// }

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
        <View style={{ flex: 1, backgroundColor: 'white' }}>

            <View style={{
                width: width,
                height: 120,
                backgroundColor: '#DBE2EF',
                flexDirection: 'row',
            }}>

                <View style={{ justifyContent: 'flex-start', marginTop: 20, height: 100, width: 60, backgroundColor: 'blue' }}>
                    <Text style={{ textAlign: 'center', fontSize: 40, fontWeight: 'bold', marginTop: 30, marginLeft: 10 }}>
                        {dayjs().date()}
                    </Text>

                </View>

                <View style={{ marginTop: 20, height: 100, width: 100, backgroundColor: 'pink', justifyContent: 'center', alignContent: 'center' }}>
                    <View style={{
                        marginLeft: 10, marginTop: 20, width: 80, height: 50, justifyContent: 'flex-start', flexDirection: 'column', backgroundColor: 'green'
                    }}>
                        <Text style={{ fontSize: 15 }}>
                            {dayjs().format('ddd')}
                        </Text>

                        <Text style={{ fontSize: 15 }}>
                            {months[dayjs().month()]} {dayjs().year()}
                        </Text>
                    </View>


                </View>

            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {allTasks.map((group, index) => {
                    const dateFormatted = dayjs(group.date).format('DD MMM YYYY');
                    const isPast = dayjs(group.date, 'YYYY-MM-DD').isBefore(dayjs().format('YYYY-MM-DD'), 'day');

                    return (
                        <View key={index} style={[styles.dayContainer, isPast && { opacity: 0.5 }]}>

                            {/* <Text style={{ textAlign: 'center', fontSize: 40, fontWeight: 'bold', marginTop: 30, marginLeft: 10 }}>
                                    {dayjs().date()}
                                </Text> */}

                            <Text style={styles.dateText}>
                                <Text style={{ color: dayColour[dayjs(group.date).day()], opacity: 0.5 }}>━━━━━  </Text>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{dayjs(group.date).date()} {months[dayjs(group.date).month()]}</Text>

                                <Text style={{ color: dayColour[dayjs(group.date).day()], opacity: 0.5 }}> ━━━━━</Text>
                            </Text>

                            <Text style={{ opacity: 0.6, fontSize: 12, color: dayColour[dayjs(group.date).day()], fontWeight: 'bold', position: 'absolute', top: 29, left: width / 2 - 25 }}>
                                {dayjs(group.date).format('ddd')}
                            </Text>



                            {group.tasks.map((task, idx) => {
                                const taskDateTime = dayjs(`${group.date} ${task.time}`, 'YYYY-MM-DD HH:mm');
                                const isTimePast = taskDateTime.isBefore(dayjs());
                                // setTaskImage(task)
                                // setRequireImage(true) 

                                return (
                                    <View key={idx} style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: 8,
                                        opacity: isTimePast ? 0.5 : 1,
                                        // backgroundColor: 'pink'
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                            <Image
                                                source={require('./Image/clock.png')}
                                                style={{ width: 15, height: 15 }}
                                            />
                                            <Text style={styles.timeText}>
                                                { } {(task.time || '00:00').replace(':', '.')}
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
                                            <Text style={{ fontSize: 14, }}>{task.name}</Text>
                                            {task.category && categoryImages[task.category] && (
                                                <Image
                                                    source={categoryImages[task.category]}
                                                    style={{ width: 35, height: 35,position:'absolute', right:5,  }}
                                                />
                                            )}


                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView >
        </View >
    );
}


const styles = StyleSheet.create({
    scrollContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
        paddingTop: 20,
        // backgroundColor:'pink'
    },
    dayContainer: {
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        // backgroundColor: '#f5f5f5',
        // backgroundColor: 'red',
        borderRadius: 10,
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
        fontWeight: 'bold'
    },



});