import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface EmployeeShift {
  name: string;
  startTime: string;
  endTime: string;
  hours: number;
  breaks: string[];
}

interface BreakSchedulerProps {
  onSchedulesGenerated?: (schedules: EmployeeShift[]) => void;
}

export default function BreakScheduler({ onSchedulesGenerated }: BreakSchedulerProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [schedules, setSchedules] = useState<EmployeeShift[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setManualInput('');
        // For now, we'll use manual input. OCR can be added later
        Alert.alert(
          'Image Selected',
          'Please enter the schedule manually for now. OCR parsing coming soon!',
          [{ text: 'OK', onPress: () => setShowManualInput(true) }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const parseTime = (timeStr: string): number => {
    // Parse time string like "9:00 AM" or "14:30" to minutes since midnight
    const cleanTime = timeStr.trim().toUpperCase();
    const isPM = cleanTime.includes('PM') && !cleanTime.includes('12:');
    const isAM = cleanTime.includes('AM');
    
    const timeMatch = cleanTime.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return 0;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    
    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const calculateBreaks = (startTime: number, endTime: number): string[] => {
    const totalMinutes = endTime - startTime;
    const totalHours = totalMinutes / 60;
    const breaks: string[] = [];
    
    if (totalHours >= 5 && totalHours < 6.5) {
      // One 30-minute break + One 10-minute break
      const break1 = startTime + (totalMinutes * 0.25); // 25% into shift
      const break2 = startTime + (totalMinutes * 0.75); // 75% into shift
      breaks.push(formatTime(break1) + ' (30 min)');
      breaks.push(formatTime(break2) + ' (10 min)');
    } else if (totalHours >= 6.5) {
      // One 30-minute break + Two 10-minute breaks
      const break1 = startTime + (totalMinutes * 0.33); // 33% into shift
      const break2 = startTime + (totalMinutes * 0.55); // 55% into shift
      const break3 = startTime + (totalMinutes * 0.80); // 80% into shift
      breaks.push(formatTime(break1) + ' (30 min)');
      breaks.push(formatTime(break2) + ' (10 min)');
      breaks.push(formatTime(break3) + ' (10 min)');
    }
    
    return breaks;
  };

  const parseSchedule = (text: string): EmployeeShift[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const shifts: EmployeeShift[] = [];
    const shiftLeadStartTime = lines[0]?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)?.[0] || '';
    const leadStart = parseTime(shiftLeadStartTime);
    
    // Simple pattern matching: "Name StartTime-EndTime" or "Name StartTime to EndTime"
    lines.forEach((line, index) => {
      const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/gi;
      const times = line.match(timePattern);
      
      if (times && times.length >= 2) {
        const startTime = parseTime(times[0]);
        const endTime = parseTime(times[1]);
        const nameMatch = line.match(/^([^0-9]+)/);
        const name = nameMatch ? nameMatch[1].trim() : `Employee ${index + 1}`;
        const hours = (endTime - startTime) / 60;
        
        // Only add breaks if employee starts at same time or after shift lead
        if (startTime >= leadStart && hours >= 5) {
          const breaks = calculateBreaks(startTime, endTime);
          shifts.push({
            name,
            startTime: times[0],
            endTime: times[1],
            hours: parseFloat(hours.toFixed(2)),
            breaks,
          });
        }
      }
    });
    
    return shifts;
  };

  const handleProcess = () => {
    setIsProcessing(true);
    try {
      if (manualInput.trim()) {
        const parsed = parseSchedule(manualInput);
        if (parsed.length === 0) {
          Alert.alert('Error', 'Could not parse schedule. Please format as:\nName StartTime-EndTime\nExample: John 9:00 AM-3:30 PM');
          return;
        }
        setSchedules(parsed);
        if (onSchedulesGenerated) {
          onSchedulesGenerated(parsed);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process schedule');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Break Scheduler</Text>
      <Text style={styles.subtitle}>Upload schedule screenshot or enter manually</Text>
      
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <IconSymbol name="photo.fill" size={24} color="#007AFF" />
        <Text style={styles.imageButtonText}>Pick Schedule Image</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      )}

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowManualInput(!showManualInput)}
      >
        <Text style={styles.toggleButtonText}>
          {showManualInput ? 'Hide' : 'Show'} Manual Input
        </Text>
      </TouchableOpacity>

      {showManualInput && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Enter schedule (one per line):{'\n'}
            Format: Name StartTime-EndTime{'\n'}
            Example: John 9:00 AM-3:30 PM
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={8}
            placeholder="John 9:00 AM-3:30 PM&#10;Jane 9:00 AM-4:00 PM&#10;Bob 10:00 AM-4:30 PM"
            value={manualInput}
            onChangeText={setManualInput}
          />
          <TouchableOpacity
            style={[styles.processButton, isProcessing && styles.processButtonDisabled]}
            onPress={handleProcess}
            disabled={isProcessing}
          >
            <Text style={styles.processButtonText}>
              {isProcessing ? 'Processing...' : 'Generate Break Schedule'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {schedules.length > 0 && (
        <ScrollView style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Break Schedule</Text>
          {schedules.map((schedule, index) => (
            <View key={index} style={styles.scheduleCard}>
              <Text style={styles.employeeName}>{schedule.name}</Text>
              <Text style={styles.shiftTime}>
                {schedule.startTime} - {schedule.endTime} ({schedule.hours} hrs)
              </Text>
              {schedule.breaks.length > 0 ? (
                <View style={styles.breaksContainer}>
                  <Text style={styles.breaksTitle}>Breaks:</Text>
                  {schedule.breaks.map((breakTime, i) => (
                    <Text key={i} style={styles.breakTime}>
                      • {breakTime}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.noBreaks}>No breaks required</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    marginBottom: 12,
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  toggleButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
    color: '#000000',
  },
  processButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleContainer: {
    maxHeight: 400,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  breaksContainer: {
    marginTop: 8,
  },
  breaksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  breakTime: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    marginTop: 2,
  },
  noBreaks: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});

