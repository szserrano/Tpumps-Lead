import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { extractTextFromImage } from '@/utils/ocrService';
import { GOOGLE_CLOUD_VISION_API_KEY } from '@/config/ocrConfig';

// Create a type for the employee shift
interface EmployeeShift {
  name: string;
  startTime: string;
  endTime: string;
  hours: number;
  breaks: string[];
}

interface RawEmployeeShift {
  name: string;
  startTime: string;
  endTime: string;
  hours: string;
}
// Create a type for the break scheduler props
interface BreakSchedulerProps {
  onSchedulesGenerated?: (schedules: EmployeeShift[]) => void;
}

export default function BreakScheduler({ onSchedulesGenerated }: BreakSchedulerProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [schedules, setSchedules] = useState<EmployeeShift[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setManualInput('');
        setOcrError(null);
        
        // Automatically process with OCR
        await processImageWithOCR(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const processImageWithOCR = async (uri: string) => {
    // Check if API key is configured
    if (!GOOGLE_CLOUD_VISION_API_KEY || GOOGLE_CLOUD_VISION_API_KEY === 'YOUR_GOOGLE_CLOUD_VISION_API_KEY_HERE') {
      Alert.alert(
        'OCR Not Configured',
        'Please configure your Google Cloud Vision API key in config/ocrConfig.ts. For now, you can enter the schedule manually.',
        [
          { text: 'Enter Manually', onPress: () => setShowManualInput(true) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setIsOCRProcessing(true);
    setOcrError(null);

    try {
      // Extract text from image using OCR
      const result = await extractTextFromImage(uri, GOOGLE_CLOUD_VISION_API_KEY);
      
      if (result.text && result.text.trim().length > 0) {
        // Set the extracted text to manual input for user review/editing
        setManualInput(result.text);
        console.log('original text from result.text', result.text);
        
        // Automatically try to parse and process
        const parsed = parseSchedule(result.text);
        console.log("parsed from result.text", parsed)
        
        if (parsed.length > 0) {
          // Successfully parsed, show results
          setSchedules(parsed);
          if (onSchedulesGenerated) {
            onSchedulesGenerated(parsed);
          }
          Alert.alert(
            'Success!',
            `Extracted ${parsed.length} employee schedule(s) from the image.`,
            [{ text: 'OK' }]
          );
          setShowManualInput(false); // Hide manual input since we got results
        } else {
          // OCR extracted text but couldn't parse it
          Alert.alert(
            'Text Extracted',
            'OCR extracted text from the image, but couldn\'t automatically parse it. Please review and edit the text below.',
            [
              { text: 'Review & Edit', onPress: () => setShowManualInput(true) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }
      } else {
        // No text found in image
        Alert.alert(
          'No Text Found',
          'Could not extract text from the image. Please try again with a clearer image or enter the schedule manually.',
          [
            { text: 'Enter Manually', onPress: () => setShowManualInput(true) },
            { text: 'Try Again', style: 'cancel' }
          ]
        );
      }
    } catch (error: any) {
      console.error('OCR Processing Error:', error);
      const errorMessage = error.message || 'Failed to process image with OCR';
      setOcrError(errorMessage);
      
      Alert.alert(
        'OCR Error',
        `Failed to process image: ${errorMessage}\n\nYou can still enter the schedule manually.`,
        [
          { text: 'Enter Manually', onPress: () => setShowManualInput(true) },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } finally {
      setIsOCRProcessing(false);
    }
  };

  // Helper functions to check if the line is a name, time, duration, or avatar initials to be ignored
  const isName = (line: string) =>
    /^[A-Za-z]+\s[A-Z]\.?$/.test(line.trim());
  
  const isTime = (line: string) =>
    /^\d{1,2}:\d{2}\s?(am|pm)$/i.test(line.trim());
  
  const isDuration = (line: string) =>
    /^\d+(\.\d+)?\s?hr(s)?$/i.test(line.trim());

  const isAvatarInitials = (line: string) =>
    /^[A-Z]{1,3}$/.test(line.trim());

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

  // Type guard to check if Partial<RawEmployeeShift> is a complete RawEmployeeShift
  const isCompleteRawShift = (shift: Partial<RawEmployeeShift> | null): shift is RawEmployeeShift => {
    return shift !== null && 
           typeof shift.name === 'string' && shift.name !== '' &&
           typeof shift.startTime === 'string' && shift.startTime !== '' &&
           typeof shift.endTime === 'string' && shift.endTime !== '';
  };

  // Convert RawEmployeeShift to EmployeeShift
  const convertToEmployeeShift = (rawShift: RawEmployeeShift): EmployeeShift | null => {
    const startTime = parseTime(rawShift.startTime);
    const endTime = parseTime(rawShift.endTime);
    
    // Validate times
    if (startTime <= 0 || endTime <= startTime) {
      console.log(`Invalid times for ${rawShift.name}: ${rawShift.startTime} - ${rawShift.endTime}`);
      return null;
    }
    
    const hours = (endTime - startTime) / 60;
    const breaks = calculateBreaks(startTime, endTime);
    
    return {
      name: rawShift.name,
      startTime: rawShift.startTime,
      endTime: rawShift.endTime,
      hours: parseFloat(hours.toFixed(2)),
      breaks,
    };
  };

  const parseSchedule = (text: string): EmployeeShift[] => {
    const lines = text.split('\n').filter(line => line.trim()); // split the text by new lines and trim the whitespace
    console.log("lines here:", lines);
    
    const rawShifts: RawEmployeeShift[] = [];
    const shifts: EmployeeShift[] = [];
    
    // Find the shift lead start time (usually first time mentioned)
    const firstTimeMatch = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    const shiftLeadStartTime = firstTimeMatch ? firstTimeMatch[0] : '';
    const leadStart = parseTime(shiftLeadStartTime);
    
    // Track current employee being processed
    let currentEmployee: Partial<RawEmployeeShift> | null = null;
    
    // Loop through each line and parse the schedule line by line
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      
      // Clean line of common OCR artifacts
      const cleanLine = line
        .replace(/[|│]/g, '|') // Normalize pipe characters
        .replace(/[—–]/g, '-') // Normalize dashes
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      // Skip avatar initials and empty lines
      if (isAvatarInitials(cleanLine) || !cleanLine) {
        continue;
      }
      
      // Check if this line contains a name
      if (isName(cleanLine)) {
        // If we have a previous employee being processed, save it before starting a new one
        if (isCompleteRawShift(currentEmployee)) {
          console.log("pushing currentEmployee to rawShifts before starting a new employee", currentEmployee);
          rawShifts.push({
            name: currentEmployee.name,
            startTime: currentEmployee.startTime,
            endTime: currentEmployee.endTime,
            hours: currentEmployee.hours || '',
          });
        }
        console.log("starting a new employee", cleanLine.trim());
        // Start a new employee
        currentEmployee = {
          name: cleanLine.trim(),
          startTime: '',
          endTime: '',
          hours: '',
        };
        continue;
      }
      
      // Check if this line contains times
      const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/gi;
      const timeMatches = Array.from(cleanLine.matchAll(timePattern));
      
      if (timeMatches.length >= 2) {
        // We have both start and end times on this line
        const startTimeStr = timeMatches[0][0];
        const endTimeStr = timeMatches[timeMatches.length - 1][0];
        
        // If we don't have a current employee, try to extract name from this line
        if (!currentEmployee) {
          const firstTimeIndex = timeMatches[0].index !== undefined ? timeMatches[0].index : cleanLine.indexOf(startTimeStr);
          const nameMatch = cleanLine.substring(0, firstTimeIndex).trim();
          const name = nameMatch
            .replace(/[:|•·\-—]/g, '')
            .replace(/\s+/g, ' ')
            .trim() || `Employee ${index + 1}`;
          
          currentEmployee = {
            name,
            startTime: startTimeStr,
            endTime: endTimeStr,
            hours: '',
          };
        } else {
          // Update current employee with times
          currentEmployee.startTime = startTimeStr;
          currentEmployee.endTime = endTimeStr;
        }
        
        // Save this employee shift
        if (isCompleteRawShift(currentEmployee)) {
          console.log("pushing currentEmployee to rawShifts after finding both times", currentEmployee);
          rawShifts.push({
            name: currentEmployee.name,
            startTime: currentEmployee.startTime,
            endTime: currentEmployee.endTime,
            hours: currentEmployee.hours || '',
          });
          currentEmployee = null; // Reset for next employee
        }
      } else if (timeMatches.length === 1) {
        // Single time found - could be start or end time
        const timeStr = timeMatches[0][0];
        
        if (!currentEmployee) {
          // Try to extract name and use this as start time
          const firstTimeIndex = timeMatches[0].index !== undefined ? timeMatches[0].index : cleanLine.indexOf(timeStr);
          const nameMatch = cleanLine.substring(0, firstTimeIndex).trim();
          const name = nameMatch
            .replace(/[:|•·\-—]/g, '')
            .replace(/\s+/g, ' ')
            .trim() || `Employee ${index + 1}`;
          
          currentEmployee = {
            name,
            startTime: timeStr,
            endTime: '',
            hours: '',
          };
        } else {
          // If we have a name but no start time, this is the start time
          if (!currentEmployee.startTime) {
            currentEmployee.startTime = timeStr;
          } else if (!currentEmployee.endTime) {
            // If we have start time, this is the end time
            currentEmployee.endTime = timeStr;
            
            // Save this employee shift
            if (isCompleteRawShift(currentEmployee)) {
              console.log("pushing currentEmployee to rawShifts after finding end time", currentEmployee);
              rawShifts.push({
                name: currentEmployee.name,
                startTime: currentEmployee.startTime,
                endTime: currentEmployee.endTime,
                hours: currentEmployee.hours || '',
              });
              currentEmployee = null; // Reset for next employee
            }
          }
        }
      } else if (isDuration(cleanLine)) {
        // Duration line - extract hours if needed
        if (currentEmployee) {
          currentEmployee.hours = cleanLine.trim();
        }
      }
      // If line doesn't match any pattern, continue to next line
    }
    
    // Don't forget the last employee if we're still processing one
    if (isCompleteRawShift(currentEmployee)) {
      const { name, startTime, endTime, hours } = currentEmployee;
      rawShifts.push({
        name,
        startTime,
        endTime,
        hours: hours || '',
      });
    }
    
    console.log("Raw shifts created:", rawShifts);
    
    // Convert RawEmployeeShift objects to EmployeeShift objects
    rawShifts.forEach((rawShift) => {
      const employeeShift = convertToEmployeeShift(rawShift);
      if (employeeShift) {
        // Only add breaks if employee starts at same time or after shift lead
        // and works at least 5 hours
        const startTime = parseTime(employeeShift.startTime);
        if (startTime >= leadStart && employeeShift.hours >= 5) {
          shifts.push(employeeShift);
        } else if (employeeShift.hours >= 5) {
          // Still add if valid shift, even if before lead start
          shifts.push(employeeShift);
          console.log("shift is at least 5 hours, should have a 30 minute break and one or two 10 minute breaks depending on the total hours > 6");
        } else {
          shifts.push(employeeShift);
          console.log("shift is less than 5 hours, should just have a 10 minute break");
        }
      }
    });
    
    console.log("Final shifts:", shifts);
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
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          {isOCRProcessing && (
            <View style={styles.ocrOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.ocrText}>Processing image with OCR...</Text>
            </View>
          )}
        </View>
      )}

      {ocrError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>OCR Error: {ocrError}</Text>
        </View>
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
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  ocrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  ocrText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
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

