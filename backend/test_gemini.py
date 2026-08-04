import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')

print("=== Testing Google Gemini API ===\n")
print(f"✓ API Key found: {'Yes' if api_key else 'No'}")
print(f"✓ Key prefix: {api_key[:15] if api_key else 'None'}...")

if api_key:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        response = model.generate_content("Say 'Gemini API is working!' in exactly those words")
        print(f"\n✅ SUCCESS! Response: {response.text}")
        print("\nGemini is ready to use!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure your API key is correct")
        print("2. Check if you have billing enabled (free tier still needs billing setup)")
        print("3. Try using 'gemini-pro' instead of 'gemini-2.0-flash-lite'")
else:
    print("\n❌ No API key found in .env file")
    print("Please add: GOOGLE_API_KEY=your-key-here")