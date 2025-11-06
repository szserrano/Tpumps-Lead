# OCR Setup Guide for Schedule Scanner

This guide will help you set up OCR (Optical Character Recognition) to automatically extract schedule information from screenshots.

## Overview

The Break Scheduler now supports automatic text extraction from schedule images using Google Cloud Vision API. When you upload a schedule screenshot, the app will:
1. Extract text from the image using OCR
2. Parse the extracted text to identify employee names and shift times
3. Automatically calculate break schedules
4. Display the results

## Setup Instructions

### Step 1: Get Google Cloud Vision API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Click "New Project" or select an existing project
   - Give it a name (e.g., "Tpumps OCR")

3. **Enable Cloud Vision API**
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click on it and press "Enable"

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Restrict the API Key (Recommended for Security)**
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API"
   - Save the changes

### Step 2: Configure the App

1. **Open the config file**
   - Navigate to: `Tpumps-Lead/config/ocrConfig.ts`

2. **Add your API key**
   ```typescript
   export const GOOGLE_CLOUD_VISION_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
   ```

3. **Save the file**

### Step 3: Install Dependencies (Optional)

If you want to use `expo-file-system` for better file handling (recommended):

```bash
cd Tpumps-Lead
npm install expo-file-system
```

The app will work without this, but it's recommended for better performance.

### Step 4: Test the Feature

1. **Run the app**
   ```bash
   npm start
   ```

2. **Navigate to Home screen** (where Break Scheduler is displayed)

3. **Upload a schedule image**
   - Click "Pick Schedule Image"
   - Select a screenshot of a schedule
   - The app will automatically process it

4. **Review the results**
   - If successful, you'll see the parsed schedules
   - If OCR extracted text but couldn't parse it, you can review and edit the text manually

## Usage

### Automatic OCR Processing

1. Select an image from your gallery
2. The app automatically processes it with OCR
3. Review the extracted schedules
4. If needed, edit the extracted text manually

### Manual Input (Fallback)

If OCR doesn't work or you prefer manual entry:
1. Click "Show Manual Input"
2. Enter schedule in format: `Name StartTime-EndTime`
   - Example: `John 9:00 AM-3:30 PM`
3. Click "Generate Break Schedule"

### Supported Schedule Formats

The parser can handle various formats:
- `John 9:00 AM-3:30 PM`
- `John: 9:00 AM to 3:30 PM`
- `John 9:00 AM 3:30 PM` (no dash)
- Multiple employees, one per line

## Pricing Information

Google Cloud Vision API has a free tier:
- **First 1,000 requests/month**: FREE
- **After that**: $1.50 per 1,000 requests

For most users, the free tier should be sufficient.

## Troubleshooting

### "OCR Not Configured" Error
- Make sure you've added your API key to `config/ocrConfig.ts`
- Check that the API key is correct and not restricted incorrectly

### "Failed to process image" Error
- Check your internet connection
- Verify the API key is valid and Cloud Vision API is enabled
- Check Google Cloud Console for any quota or billing issues

### "No Text Found" Error
- The image might be too blurry or low quality
- Try using a higher quality image
- Ensure the text in the image is clear and readable
- Use manual input as a fallback

### Parsing Issues
- If OCR extracts text but can't parse schedules:
  - Review the extracted text in the manual input field
  - Edit the format to match: `Name StartTime-EndTime`
  - The parser is flexible but may need exact time formats

## Security Best Practices

1. **Never commit your API key to version control**
   - Add `config/ocrConfig.ts` to `.gitignore` if it contains your key
   - Or use environment variables (see below)

2. **Use Environment Variables (Recommended for Production)**
   ```typescript
   // In ocrConfig.ts
   export const GOOGLE_CLOUD_VISION_API_KEY = 
     process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '';
   ```
   
   Then create a `.env` file (and add it to `.gitignore`):
   ```
   EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your_key_here
   ```

3. **Restrict API Key**
   - Always restrict your API key to Cloud Vision API only
   - Set up billing alerts in Google Cloud Console

## Alternative OCR Solutions

If you prefer not to use Google Cloud Vision API, here are alternatives:

### Tesseract.js (Client-side, Free)
- Works offline
- No API key needed
- Lower accuracy than cloud solutions
- Requires additional setup

### AWS Textract
- Similar to Google Cloud Vision
- Different pricing structure
- Requires AWS account setup

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your API key is correct
3. Test with a simple, clear schedule image first
4. Use manual input as a temporary workaround

