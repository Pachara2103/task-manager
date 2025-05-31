import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, DeviceEventEmitter } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';



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
        allFavTasks, setAllFavTasks,
        tasks, setTasks,

        markedDates, setMarkedDates,
        selectedDate, setSelectedDate,
        selectedTaskIndex, setSelectedTaskIndex,

        isFromCalendar, setFromCalendar,
        likedByDate, setLikedByDate,
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
            console.log('loading all task screen');

        }
    }, [isFocused]);

    // useEffect(() => {


    // }, [TaskToDelete]);

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

    const TaskToDelete = async (selectedTaskIndex, selectedDate) => {
        console.log("date= ", selectedDate);
        const key = `tasks-${selectedDate}`;
        console.log('selectdate= ', selectedDate);

        const saved = await AsyncStorage.getItem(key);
        let tasks = saved ? JSON.parse(saved) : [];
        console.log('task= ', tasks);

        setSelectedTaskIndex(selectedTaskIndex);
        const newTasks = tasks.filter((_, i) => i !== selectedTaskIndex);
        // setTasks(newTasks);
        // setNowTask(newTasks);
        await AsyncStorage.setItem(`tasks-${selectedDate}`, JSON.stringify(newTasks));

        const taskToDelete = tasks[selectedTaskIndex];
        const savedAll = await AsyncStorage.getItem('allTasks');
        let allTasks = savedAll ? JSON.parse(savedAll) : [];

        allTasks = allTasks.filter(t =>
            !(
                t.name.trim() === taskToDelete.name.trim() &&
                t.time.trim() === taskToDelete.time.trim() &&
                t.date.trim() === selectedDate.trim()
            )
        );
        await AsyncStorage.setItem('allTasks', JSON.stringify(allTasks));
        // setAllTasks(allTasks);

        const savedFav = await AsyncStorage.getItem('allFavTask');
        let favList = savedFav ? JSON.parse(savedFav) : [];

        favList = favList.filter(t =>
            !(t.name === taskToDelete.name &&
                t.time === taskToDelete.time &&
                t.date === selectedDate)
        );

        await AsyncStorage.setItem('allFavTask', JSON.stringify(favList));
        setAllFavTasks(favList);

        // await AsyncStorage.setItem('allFavTask', JSON.stringify([]));

        if (newTasks.length === 0) {
            // ถ้าไม่มี task แล้ว ลบจาก taskDatesMap
            const jsonMap = await AsyncStorage.getItem('taskDatesMap');
            const dateColorMap = jsonMap ? JSON.parse(jsonMap) : {};
            delete dateColorMap[selectedDate];
            await AsyncStorage.setItem('taskDatesMap', JSON.stringify(dateColorMap));
            // loadMarkedDates();
        }
        handleShowAllTasks();
    }

    const renderRightActions = (idx, date) => (
        <TouchableOpacity onPress={() => TaskToDelete(idx, date)}>
            <View style={styles.rightAction}>
                <Image source={require('./Image/delete.png')} style={{ width: 18, height: 18, marginTop: 10, marginLeft: 8 }} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

            <View style={{
                width: width,
                height: 160,
                flexDirection: 'column',
                backgroundColor: '#DBE2EF',
                // marginBottom:5

            }}>

                <View style={{ justifyContent: 'flex-start', marginTop: 80, height: 40, width: width }}>
                    <Text style={{ textAlign: 'left', fontSize: 30, fontWeight: 'bold', marginLeft: 10 }}>
                        ALL TASKS
                    </Text>

                </View>

                <View style={{ height: 30, width: width - 20, justifyContent: 'flex-start', marginLeft: 10 }}>
                    <Text style={{ fontSize: 15 }}>
                        {dayjs().format('dddd')},  {dayjs().date()} {months[dayjs().month()]} {dayjs().year()}
                    </Text>


                </View>
                <View style={{ position: 'absolute', right: 20, top: 90, borderRadius: 40, width: 50, height: 50, backgroundColor: 'white' }}>
                    <Image
                        source={require('./Image/cat.png')}
                        style={{ width: 40, height: 40, marginLeft: 7., marginTop: 3 }}
                    />
                </View>

            </View>

            <GestureHandlerRootView >

                <View style={{
                    width: width,
                    height: 590,
                    // backgroundColor: 'pink'
                }}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {allTasks.length === 0 ? (
                            <View style={{ alignItems: 'center', marginTop: height / 4 }}>
                                <Text style={{ fontSize: 30, color: 'gray' }}>NO TASK YET</Text>
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
                                            <Text style={{ color: dayColour[dayjs(group.date).day()], opacity: 0.5 }}>  ━━━━━</Text>
                                        </Text>

                                        {/* วันที่ย่อ */}
                                        <Text style={{
                                            opacity: 0.6,
                                            fontSize: 12,
                                            color: dayColour[dayjs(group.date).day()],
                                            fontWeight: 'bold',
                                            position: 'absolute',
                                            top: 19,
                                            left: width / 2 - 25
                                        }}>
                                            {dayjs(group.date).format('ddd')}
                                        </Text>

                                        {/* งานแต่ละชิ้น */}
                                        {group.tasks.map((task, idx) => {
                                            const taskDateTime = dayjs(`${group.date} ${task.time}`, 'YYYY-MM-DD HH:mm');
                                            const isTimePast = taskDateTime.isBefore(dayjs());

                                            return (
                                                <Swipeable key={idx} renderRightActions={() => renderRightActions(idx, dayjs(group.date).format('YYYY-MM-DD'))}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        marginBottom: 8,
                                                        opacity: isTimePast ? 0.5 : 1,
                                                        // backgroundColor: 'red',
                                                        width: 330
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
                                                </Swipeable>
                                            );
                                        })}
                                    </View>

                                );
                            })
                        )}
                    </ScrollView>



                </View>
            </GestureHandlerRootView>
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
        alignItems: 'center',
        marginVertical: 8,
        marginHorizontal: 10,
        // marginTop:10,
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