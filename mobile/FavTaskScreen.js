import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image, ScrollView, DeviceEventEmitter } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';



function formatDate(dateString) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
}

const { width, height } = Dimensions.get('window');


export default function FavTaskScreen({ route, navigation }) {
    const { isShowFav, isShowAllList, isShowHome, isShowAdd, allTasks } = route.params || {};
    console.log('alltask= ', allTasks);
    console.log('all list show= ', isShowAllList);
    console.log('route.params', route.params);

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


    return (
        <View style={{ flex: 1 }}>
            <Text>ALLLLLL</Text>
            {isShowFav && (
                <ScrollView
                    style={{
                        padding: 10, maxHeight: height / 2 - 100, width: width, backgroundColor: '#E3FDFD', left: 50,
                    }}
                >
                    {allFavTasks.map((group) => (
                        <View key={group.date} style={{ marginBottom: 12 }}>
                            <Text style={{ fontWeight: 'bold', color: dayjs(group.date).isBefore(dayjs(), 'day') ? 'gray' : 'black' }}>
                                {dayjs(group.date).format('DD MMM YYYY')}
                            </Text>
                            {group.tasks.map((task, index) => {
                                const now = dayjs();
                                const timeFormatted = task.time.replace('.', ':');
                                const taskDateTime = dayjs(`${group.date} ${timeFormatted}`, 'YYYY-MM-DD HH:mm');
                                console.log("timeFormatted");
                                const isPast = taskDateTime.isBefore(now);
                                console.log('isPast', isPast);

                                return (
                                    <Text
                                        key={index}
                                        style={{
                                            color: isPast ? 'gray' : 'black',
                                            opacity: isPast ? 0.5 : 1,
                                            marginLeft: 8,
                                            marginTop: 4,
                                        }}
                                    >
                                        {task.time || '00.00'} : {task.name}
                                    </Text>
                                );
                            })}
                        </View>
                    ))}
                </ScrollView>
            )}

            {isShowFav && (
                <View style={styles.ImageTitle}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, left: 135, top: 12.5, color: 'black' }}>FAV-LIST</Text>
                </View>
            )}
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
        left: 50,
        backgroundColor: '#A6E3E9',
        // opacity:0.2,
    }


});