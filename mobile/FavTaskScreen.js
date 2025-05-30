import React, { useState, useEffect, useContext} from 'react';
import { View, Text, Dimensions, StyleSheet, Animated, Image, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native';
import dayjs from 'dayjs';
import { AppContext } from './AppContext';
import { useIsFocused } from '@react-navigation/native';  // ⬅️ นำเข้า hook นี้


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
        allFavTasks, setAllFavTasks,
    } = useContext(AppContext);

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

    const groupedTasks  = groupTasksByDate(allFavTasks);

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

            </View>

            <View style={{
                height: height - 260,

            }}>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {groupedTasks.map((group, index) => {
                        const isPast = dayjs(group.date, 'YYYY-MM-DD').isBefore(dayjs().format('YYYY-MM-DD'), 'day');

                        return (
                            <View key={index} style={[styles.dayContainer, isPast && { opacity: 0.5 }]}>

                                <Text style={styles.dateText}>
                                    <Text style={{ color: dayColour[dayjs(group.date).day()], opacity: 0.5 }}>━━━━━  </Text>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{dayjs(group.date).date()} {months[dayjs(group.date).month()]}</Text>

                                    <Text style={{ color: dayColour[dayjs(group.date).day()], opacity: 0.5 }}> ━━━━━</Text>
                                </Text>

                                <Text style={{ opacity: 0.6, fontSize: 12, color: dayColour[dayjs(group.date).day()], fontWeight: 'bold', position: 'absolute', top: 20, left: width / 2 - 25 }}>
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
                                    );
                                })}
                            </View>
                        );
                    })}
                </ScrollView >
            </View>

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