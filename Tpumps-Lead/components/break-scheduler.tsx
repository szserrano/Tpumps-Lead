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
        console.log(result.text);
        
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
    // Clean up OCR text - remove extra whitespace and normalize
    const cleanedText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    console.log("cleanedText here:", cleanedText)
    const lines = cleanedText.split('\n').filter(line => line.trim());
    console.log("lines here:", lines)
    const shifts: EmployeeShift[] = [];
    
    // Find the shift lead start time (usually first time mentioned)
    const firstTimeMatch = cleanedText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    const shiftLeadStartTime = firstTimeMatch ? firstTimeMatch[0] : '';
    const leadStart = parseTime(shiftLeadStartTime);
    
    // Enhanced pattern matching for OCR output
    // Patterns to match:
    // 1. "Name StartTime-EndTime" or "Name StartTime to EndTime"
    // 2. "Name: StartTime-EndTime"
    // 3. "Name StartTime EndTime" (without dash)
    // 4. Handle OCR artifacts like "|", "-", "—"
    
    lines.forEach((line, index) => {
      // Clean line of common OCR artifacts
      const cleanLine = line
        .replace(/[|│]/g, '|') // Normalize pipe characters
        .replace(/[—–]/g, '-') // Normalize dashes
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      // Pattern to match times (more flexible for OCR)
      const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/gi;
      const timeMatches = cleanLine.matchAll(timePattern);
      const times = Array.from(timeMatches);
      
      if (times && times.length >= 2) {
        const startTimeStr = times[0][0]; // First time match
        const endTimeStr = times[times.length - 1][0]; // Last time match
        
        const startTime = parseTime(startTimeStr);
        const endTime = parseTime(endTimeStr);
        
        // Extract name - everything before the first time
        const firstTimeIndex = times[0].index !== undefined ? times[0].index : cleanLine.indexOf(startTimeStr);
        const nameMatch = cleanLine.substring(0, firstTimeIndex).trim();
        // Remove common separators and clean up
        const name = nameMatch
          .replace(/[:|•·\-—]/g, '')
          .replace(/\s+/g, ' ')
          .trim() || `Employee ${index + 1}`;
        
        // Validate times
        if (startTime > 0 && endTime > startTime) {
          const hours = (endTime - startTime) / 60;
          
          // Only add breaks if employee starts at same time or after shift lead
          // and works at least 5 hours
          if (startTime >= leadStart && hours >= 5) {
            const breaks = calculateBreaks(startTime, endTime);
            shifts.push({
              name,
              startTime: startTimeStr,
              endTime: endTimeStr,
              hours: parseFloat(hours.toFixed(2)),
              breaks,
            });
          } else if (hours >= 5) {
            // Still add if valid shift, even if before lead start
            const breaks = calculateBreaks(startTime, endTime);
            shifts.push({
              name,
              startTime: startTimeStr,
              endTime: endTimeStr,
              hours: parseFloat(hours.toFixed(2)),
              breaks,
            });
          }
        }
      } else if (times && times.length === 1) {
        // Single time found - might be a partial entry, try to extract more info
        const timeStr = times[0][0];
        const firstTimeIndex = times[0].index !== undefined ? times[0].index : cleanLine.indexOf(timeStr);
        const nameMatch = cleanLine.substring(0, firstTimeIndex).trim();
        const name = nameMatch
          .replace(/[:|•·\-—]/g, '')
          .replace(/\s+/g, ' ')
          .trim() || `Employee ${index + 1}`;
        
        // Could be just start time, log for manual review
        console.log(`Partial entry found: ${name} - ${timeStr}`);
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

