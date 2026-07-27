import requests
import json

url = "http://localhost:8000/negotiate"
params = {
    "role": "CEO of Apex Labs",
    "prompt": "Implement mandatory AI monitoring for all employees"
}

print("Testing negotiate endpoint...")
response = requests.get(url, params=params, stream=True, timeout=120)

print(f"Status: {response.status_code}")

for line in response.iter_lines():
    if line:
        line_str = line.decode('utf-8')
        if line_str.startswith('data:'):
            data = json.loads(line_str[5:].strip())
            print(f"\nTurn: {data.get('name', 'Unknown')}")
            print(f"Text: {data.get('text', '')[:200]}...")
            
            if data.get('type') == 'accord':
                print("\n=== ACCORD REACHED ===")
                break

print("\nTest completed!")
