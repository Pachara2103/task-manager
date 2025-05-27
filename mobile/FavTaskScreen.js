import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet, Animated, Image, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native';
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


export default function FavTaskScreen({ visible, onRequestClose }) {
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

    const [ShowfavScreen, setShowFavScreen] = useState(true);
    const [isVisible, setIsVisible] = useState(visible);
    // const { isShowFav, isShowAllList, isShowHome, isShowAdd, allTasks } = route.params || {};
    // console.log('alltask= ', allTasks);
    // console.log('all list show= ', isShowAllList);
    // const popupAnim = useRef(new Animated.Value(600)).current; // เริ่มอยู่นอกจอด้านล่าง
    const popupHeightAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setIsVisible(true);  // แสดงก่อน animate

            Animated.timing(popupHeightAnim, {
                toValue: height / 2 - 200,
                duration: 300,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(popupHeightAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                setIsVisible(false);  // ซ่อนหลัง animation จบ
            });
        }
    }, [visible]);

    const {
        allTasks, setAllTasks,
        allFavTasks, setAllFavTasks,
        tasks, setTasks,

        markedDates, setMarkedDates,
        selectedDate, setSelectedDate,
        selectedTaskIndex, setSelectedTaskIndex,

        isShowFav, setShowFav,
        isLiked, setIsLiked,
        isShowAllList, setShowAllList,
        isShowFavTask, setShowFavTask,

        isFromCalendar, setFromCalendar,

        likedByDate, setLikedByDate,

    } = useContext(AppContext);
    // console.log('Call Fav Task Screennnnnnn');
    // console.log('isShowFavTask in fav task screen: ', isShowFavTask);
    // console.log('ShowFavTScreen in fav task screen: ', ShowfavScreen);
    // console.log('allFavTasks= ', allFavTasks);
    // console.log('likedByDate ', likedByDate);


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

    if (!isVisible) return null;

    // const handleClose = () => {
    //     setShowFavScreen(false); // แทน onClose โดยตรง
    // };



    return (
        <View style={StyleSheet.absoluteFill}>
            {/* <TouchableWithoutFeedback onPress={onRequestClose}>
                <View style={{
                    position: 'absolute',
                    // bottom:80,
                    height: height - 80,
                    width: width,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                }} />
            </TouchableWithoutFeedback> */}

            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 80,
                    left: 0,
                    right: 0,
                    height: popupHeightAnim,
                    backgroundColor: 'pink',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 20,
                    zIndex: 999,
                    overflow: 'hidden',
                }}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {allFavTasks.length > 0 &&
                        Array.from(
                            new Set(allFavTasks.map((task) => task.date))
                        ).map((date) => {
                            const tasksForDate = allFavTasks.filter((task) => task.date === date);
                            return (
                                <View
                                    key={date}
                                    style={{
                                        width: 170,
                                        marginRight: 10,
                                        backgroundColor: '#fce4ec',
                                        borderRadius: 40,
                                        padding: 5,
                                    }}  >

                                    <TouchableOpacity
                                        onPress={() => {
                                            // setLikedByDate(prev => ({
                                            //     ...prev,
                                            //     [selectedDate]: !prev[selectedDate]
                                            // }));
                                            Alert.alert("wow")
                                        }}>

                                        <Image
                                            source={
                                                likedByDate[selectedDate]
                                                    ? require('./Image/fullheart2.png')
                                                    : require('./Image/noheart2.png')
                                            }
                                            style={{ width: 35, height: 35, position: 'absolute', top: 5, left: 10 }}
                                        />
                                    </TouchableOpacity>



                                    <View style={{
                                        width: 110,
                                        height: 40,
                                        backgroundColor: 'orange',
                                        flexDirection: 'row',
                                        marginLeft: 50,

                                    }}>

                                        <View style={{ justifyContent: 'flex-end', height: 40, width: 40, backgroundColor: 'red' }}>

                                            <Text style={{ textAlign: 'center', fontSize: 30, fontWeight: 'bold' }}>
                                                {dayjs(date).date()}
                                            </Text>

                                        </View>

                                        <View style={{ height: 40, width: 70, backgroundColor: 'white', justifyContent: 'flex-start', alignContent: 'center' }}>

                                            <View style={{
                                                marginTop: 6, width: 70, height: 35, justifyContent: 'flex-start', flexDirection: 'column', backgroundColor: 'white'
                                            }}>
                                                <Text style={{ fontSize: 14, color: dayColour[dayjs(date).day()], fontWeight: 'bold' }}>
                                                    {dayjs(date).format('ddd')}
                                                </Text>

                                                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
                                                    {months[dayjs(date).month()]} {dayjs(date).year()}
                                                </Text>
                                            </View>


                                        </View>

                                    </View>

                                    {/* ScrollView แนวตั้งภายในแต่ละวัน */}
                                    <ScrollView style={{ maxHeight: 200 }}>
                                        {tasksForDate.map((task, index) => (
                                            <View
                                                key={index}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {/* เวลาและไอคอน */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center', width: 80 }}>
                                                    <Image
                                                        source={require('./Image/clock.png')}
                                                        style={{ width: 18, height: 18, marginRight: 4 }}
                                                    />
                                                    <Text>{(task.time || '00:00').replace(':', '.')}</Text>
                                                </View>

                                                {/* Task Name */}
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        backgroundColor: '#DBE2EF',
                                                        padding: 8,
                                                        borderRadius: 6,
                                                    }}
                                                >
                                                    <Text>{task.name}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            );
                        })}
                </ScrollView>
            </Animated.View>
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