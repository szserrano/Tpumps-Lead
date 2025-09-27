import { StyleSheet, TextInput, Button, KeyboardAvoidingView, Alert, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';

export default function CalculatorScreen() {
  const [number20s, setNumber20s] = useState('');
  const [number10s, setNumber10s] = useState('');
  const [number5s, setNumber5s] = useState('');
  const [number1s, setNumber1s] = useState('');
  const [numberCent, setNumberCent] = useState('');
  const [numberQs, setNumberQ] = useState('');
  const [numberDs, setNumberD] = useState('');
  const [numberNs, setNumberN] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  
  const [total, setTotal] = useState(0);

  const registerItems = [
    {value: number20s, multiplier: 20},
    {value: number10s, multiplier: 10}, 
    {value: number5s, multiplier: 5}, 
    {value: number1s, multiplier: 1}, 
    {value: numberCent, multiplier: 1}
  ];
  const safeItems = [
    {value: number20s, multiplier: 20},
    {value: number10s, multiplier: 10}, 
    {value: number5s, multiplier: 5}, 
    {value: number1s, multiplier: 1}, 
    {value: numberQs, multiplier: 10}, 
    {value: numberDs, multiplier: 5}, 
    {value: numberNs, multiplier: 2}
  ];

  const itemToCount = [
    {title: 'safe'},
    {title: 'register'},
  ];

  const calculateTotal = () => {
    setTotal(0);
    {/* This does different calculations if the user is counting the register or the safe. If user hasn't selected what they are counting, total will default to 0 */}
    if (selectedItem === "register") { 
      for (let i = 0; i < registerItems.length; i++){
        if (registerItems[i].value !== ''){
          setTotal(total => total + (parseFloat(registerItems[i].value) * registerItems[i].multiplier));
        } 
      }
    } else if (selectedItem === "safe"){
      for (let i = 0; i < safeItems.length; i++){
        if (safeItems[i].value !== ''){
          setTotal(total => total + (parseInt(safeItems[i].value) * safeItems[i].multiplier));
        } 
      }
    } else {
      Alert.alert("Error", "Please select what you are counting before pressing Calculate.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? "padding" : "height"}
      style={{ flex: 1}}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#D0D0D0', dark: '#38761d' }}
          headerImage={
            <IconSymbol
              size={310}
              color="#b6d7a8"
              name="dollarsign"
              style={styles.headerImage}
            />
          }>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Count the Register</ThemedText>
          </ThemedView>
          <ThemedText>This page will include the functionality to help you count your register. Please select if you are counting the register or safe and enter the counts of bills and coins below:</ThemedText>
          <ThemedView style={styles.billRowContainer}>
            <SelectDropdown
              data={itemToCount}
              onSelect={(selectedItem, index) => {
                console.log(selectedItem, index);
                setSelectedItem(selectedItem.title);
              }}
              renderButton={(selectedItem, isOpen) => {
                return (
                  <ThemedView style={styles.dropdownButtonStyle}>
                    <ThemedText style={styles.dropdownButtonTxtStyle}>{selectedItem !== null ? selectedItem.title : 'What are you counting? (Tap Me)'}</ThemedText>
                  </ThemedView>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <ThemedView
                    style={{
                      ...styles.dropdownItemStyle,
                      ...(isSelected && {backgroundColor: '#D2D9DF'}),
                    }}>
                    <ThemedText style={styles.dropdownItemTxtStyle}>{item.title}</ThemedText>
                  </ThemedView>
                );
              }}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </ThemedView>
          <ThemedView style={styles.billRowContainer}>
            <ThemedView style={styles.inputWrapper}>
              <TextInput 
                  style={styles.inputBox} 
                  keyboardType='numeric' 
                  value={number20s} 
                  onChangeText={text => setNumber20s(text)} 
                  placeholder="How many $20 bills?"
                  placeholderTextColor='grey'
              />
            </ThemedView>
            <ThemedView style={styles.multiplyBox}>
              <ThemedText>x $20 = </ThemedText>
            </ThemedView>
            <ThemedView style={styles.outputBox}>
              <ThemedText>{number20s !== '' ? parseInt(number20s) * 20 : 0}</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.billRowContainer}>
            <ThemedView style={styles.inputWrapper}>
              <TextInput 
                  style={styles.inputBox} 
                  keyboardType='numeric' 
                  value={number10s} 
                  onChangeText={text => setNumber10s(text)} 
                  placeholder="How many $10 bills?"
                  placeholderTextColor='grey'
              />
            </ThemedView>
            <ThemedView style={styles.multiplyBox}>
              <ThemedText>x $10 = </ThemedText>
            </ThemedView>
            <ThemedView style={styles.outputBox}>
              <ThemedText>{number10s !== '' ? parseInt(number10s) * 10 : 0}</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.billRowContainer}>
            <ThemedView style={styles.inputWrapper}>
              <TextInput 
                  style={styles.inputBox} 
                  keyboardType='numeric' 
                  value={number5s} 
                  onChangeText={text => setNumber5s(text)} 
                  placeholder="How many $5 bills?"
                  placeholderTextColor='grey'
              />
            </ThemedView>
            <ThemedView style={styles.multiplyBox}>
              <ThemedText>x $5 = </ThemedText>
            </ThemedView>
            <ThemedView style={styles.outputBox}>
              <ThemedText>{number5s !== '' ? parseInt(number5s) * 5 : 0}</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.billRowContainer}>
            <ThemedView style={styles.inputWrapper}>
              <TextInput 
                  style={styles.inputBox} 
                  keyboardType='numeric' 
                  value={number1s} 
                  onChangeText={text => setNumber1s(text)} 
                  placeholder="How many $1 bills?"
                  placeholderTextColor='grey'
              />
            </ThemedView>
            <ThemedView style={styles.multiplyBox}>
              <ThemedText>x $1 = </ThemedText>
            </ThemedView>
            <ThemedView style={styles.outputBox}>
              <ThemedText>{number1s !== '' ? number1s : 0}</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.billRowContainer}>
            {selectedItem === "register" && (
              <ThemedView style={styles.billRowContainer}>
                <ThemedView style={styles.inputWrapper}>
                  <TextInput 
                      style={styles.inputBox} 
                      keyboardType='numeric' 
                      value={numberCent} 
                      onChangeText={text => setNumberCent(text)} 
                      placeholder="How much in coins?"
                      placeholderTextColor='grey'
                  />
                </ThemedView>
                <ThemedView style={styles.outputBox}>
                  <ThemedText>{numberCent !== '' ? numberCent : 0}</ThemedText>
                </ThemedView>
              </ThemedView>
            )}
            {selectedItem === "safe" && (
              <ThemedView style={styles.coinRowContainer}>
                <ThemedView style={styles.billRowContainer}>
                  <ThemedView style={styles.inputWrapper}>
                    <TextInput 
                        style={styles.inputBox} 
                        keyboardType='numeric' 
                        value={numberQs} 
                        onChangeText={text => setNumberQ(text)} 
                        placeholder="Rolls of Quarters?"
                        placeholderTextColor='grey'
                    />
                  </ThemedView>
                  <ThemedView style={styles.multiplyBox}>
                    <ThemedText>x $10 = </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.outputBox}>
                    <ThemedText>{numberQs !== '' ? parseInt(numberQs) * 10 : 0}</ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.billRowContainer}>
                  <ThemedView style={styles.inputWrapper}>
                    <TextInput 
                        style={styles.inputBox} 
                        keyboardType='numeric' 
                        value={numberDs} 
                        onChangeText={text => setNumberD(text)} 
                        placeholder="Rolls of Dimes?"
                        placeholderTextColor='grey'
                    />
                  </ThemedView>
                  <ThemedView style={styles.multiplyBox}>
                    <ThemedText>x $5 = </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.outputBox}>
                    <ThemedText>{numberDs !== '' ? parseInt(numberDs) * 5 : 0}</ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.billRowContainer}>
                  <ThemedView style={styles.inputWrapper}>
                    <TextInput 
                        style={styles.inputBox} 
                        keyboardType='numeric' 
                        value={numberNs} 
                        onChangeText={text => setNumberN(text)} 
                        placeholder="Rolls of Nickels?"
                        placeholderTextColor='grey'
                    />
                  </ThemedView>
                  <ThemedView style={styles.multiplyBox}>
                    <ThemedText>x $2 = </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.outputBox}>
                    <ThemedText>{numberNs !== '' ? parseInt(numberNs) * 2 : 0}</ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            )}
            {selectedItem === '' && (
              <ThemedView style={styles.unknownCountItem}>
                <ThemedText>Please choose what you are counting above</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          <ThemedView style={styles.totalBox}>
            <ThemedText>Total = ${total.toFixed(2)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.calculateBox}>
            <Button title="Calculate!" onPress={calculateTotal}/>
          </ThemedView>
        </ParallaxScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#38761d',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  billRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  coinRowContainer: {
    flex: 1,
    justifyContent: 'space-around',
    gap: 13
  },
  unknownCountItem:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'maroon',
    borderWidth: 2,
  },
  inputWrapper: {
    width: 150,
    backgroundColor: 'white',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputBox:{
    flex: 1
  },
  multiplyBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    backgroundColor: 'red',
    borderWidth: 2,
  },
  outputBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    backgroundColor: 'blue',
    borderWidth: 2,
  },
  totalBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    borderWidth: 2,
  },
  calculateBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
  },
  dropdownButtonStyle: {
    flex: 1,
    height: 50,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#0665fd',
    textAlign: 'center'
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
});
