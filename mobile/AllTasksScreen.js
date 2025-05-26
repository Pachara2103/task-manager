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
            console.log('all Task = ', allTasks);

        } catch (e) {
            console.log('Error loading all tasks:', e);
        }
    };

    useEffect(() => {
        if (isFocused) {
            handleShowAllTasks();
            console.log('loading all task screen');

        }
    }, [isFocused]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('reloadAllTasksScreen', handleShowAllTasks);
        console.log('reloadAllTasksScreen');
        return () => {
            subscription.remove(); // cleanup เวลา component ถูก destroy
        };
    }, []);

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
                        <View key={index} style={[styles.dayContainer,isPast&& {opacity:0.5}]}>

                            <Text style={styles.dateText}>
                                <Text style={{ color: '#d7dbdd' }}>━━━━━  </Text>
                                <Text>{dateFormatted}</Text>
                                <Text style={{ color: '#d7dbdd' }}> ━━━━━</Text>
                            </Text>

                            {group.tasks.map((task, idx) => {
                                const taskDateTime = dayjs(`${group.date} ${task.time}`, 'YYYY-MM-DD HH:mm');
                                const isTimePast = taskDateTime.isBefore(dayjs());

                                return (
                                    <View key={idx} style={[styles.taskRow, isTimePast && { opacity: 0.5 }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                            <Image
                                                source={require('./Image/clock.png')}
                                                style={{ width: 15, height: 15 }}
                                            />
                                            <Text style={styles.timeText}>
                                               {} {(task.time || '00:00').replace(':', '.')}
                                            </Text>
                                        </View>

                                        <View style={styles.taskBox}>
                                            <Text style={styles.taskText}>{task.name}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    // dayContainer: {
    //     alignItems: 'center',
    //     marginVertical: 8,
    // },
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
        left: 0,
        backgroundColor: '#A6E3E9',
        // opacity:0.2,
    },/////////////////////////////////////////
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        color: 'black',
        marginBottom: 10,
    },
    scrollContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
        paddingTop: 20,
        // backgroundColor:'pink'
    },
    ListBox: {
        width: width / 2,
        backgroundColor: '#F3E0EC',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        elevation: 3,
    },
    cardDate: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'black',
        marginBottom: 4,
    },
    cardTask: {
        fontSize: 13,
        color: '#333',
    },
    moreText: {
        marginTop: 4,
        fontSize: 12,
        color: 'gray',
        fontStyle: 'italic',
    },


    dayContainer: {
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        // backgroundColor: '#f5f5f5',
        borderRadius: 10,
    },

    dateText: {
        textAlign: 'center',
        fontSize: 15,
        // fontWeight: 'bold',
        marginBottom: 10,
    },

    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        // backgroundColor:'pink'
    },

    timeText: {
        width: 60,
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold'
    },

    taskBox: {
        flex: 1,
        backgroundColor: '#fbfcfc',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    taskText: {
        fontSize: 14,
    },



});