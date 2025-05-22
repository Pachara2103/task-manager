import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, 
  Button, TouchableWithoutFeedback, Keyboard 
} from 'react-native';

export default function AddTaskScreen({ route, navigation }) {
  const { selectedDate } = route.params;
  const [taskName, setTaskName] = useState('');
  const [time, setTime] = useState({ hour: '00', min: '00' });
  const [modalVisible, setModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState('00');
  const [tempMin, setTempMin] = useState('00');

  // ฟังก์ชันเปิด modal เลือกเวลา
  const openTimePicker = () => {
    setTempHour(time.hour);
    setTempMin(time.min);
    setModalVisible(true);
  };

  // ฟังก์ชันกด OK เพื่อยืนยันเวลา
  const confirmTime = () => {
    setTime({ hour: tempHour, min: tempMin });
    setModalVisible(false);
  };

  // กดนอก modal ให้ปิด modal แล้วเวลาไม่เปลี่ยน (default)
  const cancelTime = () => {
    setModalVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        {/* แสดงวันที่ที่ส่งมา */}
        <Text style={styles.dateText}>Date: {selectedDate}</Text>

        {/* กรอกชื่อ Task */}
        <Text style={styles.label}>Task:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="ชื่องาน" 
          value={taskName} 
          onChangeText={setTaskName} 
        />

        {/* กรอบเลือกเวลา */}
        <Text style={styles.label}>Time:</Text>
        <TouchableOpacity style={styles.timeBox} onPress={openTimePicker}>
          <Text style={styles.timeText}>{time.hour}:{time.min}</Text>
        </TouchableOpacity>

        {/* Modal เลือกเวลา */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelTime}
        >
          <TouchableWithoutFeedback onPress={cancelTime}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>เลือกเวลา</Text>

                  <View style={styles.pickerRow}>
                    <View style={styles.pickerColumn}>
                      <Text>ชั่วโมง</Text>
                      <TextInput
                        style={styles.pickerInput}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={tempHour}
                        onChangeText={text => {
                          let val = text.replace(/[^0-9]/g, '');
                          if (val === '') val = '00';
                          else if (parseInt(val) > 23) val = '23';
                          else if (parseInt(val) < 0) val = '00';
                          setTempHour(val.padStart(2, '0'));
                        }}
                      />
                    </View>
                    <View style={styles.pickerColumn}>
                      <Text>นาที</Text>
                      <TextInput
                        style={styles.pickerInput}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={tempMin}
                        onChangeText={text => {
                          let val = text.replace(/[^0-9]/g, '');
                          if (val === '') val = '00';
                          else if (parseInt(val) > 59) val = '59';
                          else if (parseInt(val) < 0) val = '00';
                          setTempMin(val.padStart(2, '0'));
                        }}
                      />
                    </View>
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <Button title="OK" onPress={confirmTime} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  timeBox: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 18,
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerColumn: {
    alignItems: 'center',
    width: '45%',
  },
  pickerInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    width: '100%',
  },
});
