#!/usr/bin/env python3
"""
Test script to check backend connection and database status
"""

import requests
import json

# Test the backend endpoints
BACKEND_URL = "https://property-backend-p69z.onrender.com"

def test_endpoint(endpoint, description):
    """Test a specific endpoint"""
    try:
        url = f"{BACKEND_URL}{endpoint}"
        print(f"\nTesting {description}...")
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
            except json.JSONDecodeError:
                print(f"Response (not JSON): {response.text}")
        else:
            print(f"Error Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

def main():
    print("=== Backend Connection Test ===")
    
    # Test basic endpoint
    test_endpoint("/", "Home endpoint")
    
    # Test database connection
    test_endpoint("/test-db", "Database connection test")
    
    # Test properties endpoint
    test_endpoint("/properties", "Properties endpoint")
    
    # Test areas endpoint
    test_endpoint("/areas", "Areas endpoint")

if __name__ == "__main__":
    main()
