import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, DeviceEventEmitter } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './AppContext';



function formatDate(dateString) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
}

const { width, height } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;


export default function AllTasksScreen({ navigation }) {
    const {
        isShowFav, isShowAllList, isShowHome, isShowAdd, allTasks,
    } = useContext(AppContext);


    // console.log('all list show= ', isShowAllList);

    // console.log('alltaskbefore= ', JSON.stringify(allTasks, null, 2));


    const flatTasks = allTasks.flatMap(group =>
        group.tasks.map(task => ({
            ...task,
            date: group.date,
        }))
    );
    const groupedTasks = flatTasks.reduce((acc, task) => {
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
    // console.log('alltasklist= ', JSON.stringify(allTasksList, null, 2));


    return (
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 100 }}>
            {isShowAllList && (
                <Text style={styles.title}>ALL-LIST</Text>
            )}

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.gridContainer}>
                    {allTasksList.map((group, index) => {
                        const dateFormatted = dayjs(group.date).format('DD MMM YYYY');
                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.card}
                                onPress={() => navigation.navigate('TaskDetailScreen', { date: group.date })}
                            >
                                <Text style={styles.cardDate}>{dateFormatted}</Text>
                                {group.tasks.slice(0, 3).map((task, idx) => (
                                    <Text key={idx} style={styles.cardTask}>
                                        - {task.time || '00.00'} {task.name}
                                    </Text>
                                ))}
                                {group.tasks.length > 3 && (
                                    <Text style={styles.moreText}>+ {group.tasks.length - 3} more...</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
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
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: cardWidth,
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


});