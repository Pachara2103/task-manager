import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, Image, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native';
import dayjs from 'dayjs';
import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';  // ⬅️ นำเข้า hook นี้
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';




const { width, height } = Dimensions.get('window');

export default function FavTaskScreen({ navigation }) {
    const isFocused = useIsFocused();
    // if (!isFocused) return null;


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
    const [tasktounliked, setTaskToUnliked] = useState(dayjs(selectedDate).format('YYYY-MM-DD'));

    const categoryImages = {
        exercise: require('./Image/category/exercise.png'),
        dinner: require('./Image/category/eating.png'),
        book: require('./Image/category/book.png'),
        homework: require('./Image/category/homework.png'),
        meeting: require('./Image/category/meeting.png'),
        reminder: require('./Image/category/reminder.png'),
        sleep: require('./Image/category/sleep.png'),
    };
    // console.log('allfavTask', allFavTasks);

    function groupTasksByDate(tasks) {
        const groups = {};
        tasks.forEach(task => {
            if (!groups[task.date]) {
                groups[task.date] = { date: task.date, tasks: [] };
            }
            groups[task.date].tasks.push(task);
        });
        return Object.values(groups);

    }

    const groupedTasks = groupTasksByDate(allFavTasks);

    const renderRightActions = (idx, date) => (
        // console.log('call render right');
        <TouchableOpacity onPress={() => { TaskToDelete(idx, date); }}>
            <View style={styles.rightAction}>
                <Image source={require('./Image/delete.png')} style={{ width: 18, height: 18, marginTop: 10, marginLeft: 8 }} />
            </View>
        </TouchableOpacity>
    );
    const TaskToDelete = async (selectedTaskIndex, tasktodeletedate) => {
        // console.log('select index= ', selectedTaskIndex);
        const key = `tasks-${tasktodeletedate}`;
        const saved = await AsyncStorage.getItem(key);
        let tasks = saved ? JSON.parse(saved) : [];

        setSelectedTaskIndex(selectedTaskIndex);
        const newTasks = tasks.filter((_, i) => i !== selectedTaskIndex);
        // setTasks(newTasks);
        // setNowTask(newTasks);
        await AsyncStorage.setItem(`tasks-${tasktodeletedate}`, JSON.stringify(newTasks));

        const taskToDelete = tasks[selectedTaskIndex];
        const savedAll = await AsyncStorage.getItem('allTasks');
        let allTasks = savedAll ? JSON.parse(savedAll) : [];

        allTasks = allTasks.filter(t =>
            !(
                t.name.trim() === taskToDelete.name.trim() &&
                t.time.trim() === taskToDelete.time.trim() &&
                t.date.trim() === tasktodeletedate.trim()
            )
        );
        await AsyncStorage.setItem('allTasks', JSON.stringify(allTasks));
        // setAllTasks(allTasks);

        const savedFav = await AsyncStorage.getItem('allFavTask');
        let favList = savedFav ? JSON.parse(savedFav) : [];

        favList = favList.filter(t =>
            !(t.name === taskToDelete.name &&
                t.time === taskToDelete.time &&
                t.date === tasktodeletedate)
        );

        await AsyncStorage.setItem('allFavTask', JSON.stringify(favList));
        setAllFavTasks(favList);

        // await AsyncStorage.setItem('allFavTask', JSON.stringify([]));

        if (newTasks.length === 0) {
            // ถ้าไม่มี task แล้ว ลบจาก taskDatesMap
            const jsonMap = await AsyncStorage.getItem('taskDatesMap');
            const dateColorMap = jsonMap ? JSON.parse(jsonMap) : {};
            delete dateColorMap[tasktodeletedate];
            await AsyncStorage.setItem('taskDatesMap', JSON.stringify(dateColorMap));
            // loadMarkedDates();
        }
        // handleShowAllTasks();
    }
    const UnlikedAllTasksForDate = async (date) => {
        const savedFav = await AsyncStorage.getItem('allFavTask');
        let favList = savedFav ? JSON.parse(savedFav) : [];

        favList = favList.filter(task => task.date !== date);

        await AsyncStorage.setItem('allFavTask', JSON.stringify(favList));
        setAllFavTasks(favList);
    };



    return (
        <View style={{ flex: 1 }} >

            <View style={{
                width: width,
                height: 160,
                backgroundColor: '#DBE2EF',
                flexDirection: 'column',
            }}>

                <View style={{ justifyContent: 'flex-start', marginTop: 80, height: 40, width: width }}>
                    <Text style={{ textAlign: 'left', fontSize: 30, fontWeight: 'bold', marginLeft: 10 }}>
                        FAVORITE TASK
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
                    height: height - 260,

                }}>

                    <ScrollView contentContainerStyle={styles.scrollContainer}>

                        {groupedTasks.length === 0 ? (
                            <View style={{ alignItems: 'center', marginTop: height / 4 }}>
                                <Text style={{ fontSize: 30, color: 'gray' }}>NO FAV TASK YET</Text>
                            </View>
                        ) : (

                            groupedTasks.map((group, index) => {
                                const isPast = dayjs(group.date, 'YYYY-MM-DD').isBefore(dayjs().format('YYYY-MM-DD'), 'day');

                                return (
                                    <View key={index} style={[styles.dayContainer, isPast && { opacity: 0.5 }]}>

                                        <Text style={styles.dateText}>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{dayjs(group.date).date()} {months[dayjs(group.date).month()]}</Text>

                                        </Text>

                                        <Text style={{ opacity: 0.6, fontSize: 12, color: dayColour[dayjs(group.date).day()], fontWeight: 'bold', position: 'absolute', top: 20, left: width / 2 - 25 }}>
                                            {dayjs(group.date).format('ddd')}
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setTaskToUnliked(dayjs(group.date).format('YYYY-MM-DD'));
                                            console.log('likedbydate before=', likedByDate);
                                            console.log('date to unliked=', dayjs(group.date).format('YYYY-MM-DD'));
                                            Alert.alert(
                                                "ยืนยันการลบ",
                                                "คุณต้องการลบรายการที่ถูกใจหรือไม่?",
                                                [
                                                    {
                                                        text: "Cancel",
                                                        onPress: () => console.log("ยกเลิก"),
                                                        style: "cancel"
                                                    },
                                                    {
                                                        text: "Delete",
                                                        onPress: () => {
                                                            setLikedByDate(prev => ({
                                                                ...prev,
                                                                [dayjs(group.date).format('YYYY-MM-DD')]: false,
                                                            }));

                                                            UnlikedAllTasksForDate(dayjs(group.date).format('YYYY-MM-DD'));


                                                        },
                                                        style: "destructive"  // สีแดงใน iOS, Android บางรุ่นก็รองรับ
                                                    }
                                                ],
                                                { cancelable: true }
                                            );
                                        }}
                                            style={{ position: 'absolute', right: 110 }}
                                        >
                                            <Image
                                                source={
                                                    require('./Image/fullheart2.png')
                                                }

                                                style={{ width: 30, height: 30 }}
                                            />
                                        </TouchableOpacity>



                                        {group.tasks.map((task, idx) => {
                                            const taskDateTime = dayjs(`${group.date} ${task.time}`, 'YYYY-MM-DD HH:mm');
                                            const isTimePast = taskDateTime.isBefore(dayjs());


                                            return (

                                                <Swipeable key={idx} renderRightActions={() => {
                                                    // setTaskToDeleteDate(dayjs(group.date).format('YYYY-MM-DD'));
                                                    return renderRightActions(idx, dayjs(group.date).format('YYYY-MM-DD')); // ต้อง return
                                                }}
                                                >
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        marginBottom: 8,
                                                        opacity: isTimePast ? 0.5 : 1,
                                                        width: 330,
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
                                                            flexDirection: 'row',
                                                            //  backgroundColor: 'red',
                                                        }}>
                                                            <Text style={{ fontSize: 14, }}>{task.name}</Text>
                                                            {task.category && categoryImages[task.category] && (
                                                                <Image
                                                                    source={categoryImages[task.category]}
                                                                    style={{ width: 35, height: 35, position: 'absolute', right: 5, }}
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
                    </ScrollView >
                </View>
            </GestureHandlerRootView>

        </View>
    );



}

const styles = StyleSheet.create({
    scrollContainer: {
        // flexGrow: 1,
        // width: width,
        // // marginLeft:10,
        // height: height - 260,
        // overflow: 'hidden',

        paddingHorizontal: 10,
        paddingBottom: 20,
        paddingTop: 20,
        // backgroundColor: 'red'
    },
    dayContainer: {
        alignItems: 'center',
        marginVertical: 8,
        //    backgroundColor: 'blue',
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