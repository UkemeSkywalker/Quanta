#!/usr/bin/env python3
"""
Simple API integration test script for Quanta AI Scientist
Tests the basic API endpoints to ensure they're working correctly.
"""

import requests
import json
import sys
from typing import Dict, Any

API_BASE_URL = "http://localhost:8000"

def test_health_endpoint() -> bool:
    """Test the health check endpoint."""
    print("🧪 Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy" and data.get("service") == "quanta-api":
                print("✅ Health endpoint test passed")
                return True
            else:
                print(f"❌ Health endpoint returned unexpected data: {data}")
                return False
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Health endpoint test failed: {e}")
        return False

def test_research_submit_endpoint() -> tuple[bool, str]:
    """Test the research submit endpoint."""
    print("🧪 Testing research submit endpoint...")
    
    test_query = {
        "query": "Analyze the impact of artificial intelligence on scientific research productivity",
        "user_id": "test_user_123",
        "priority": 3,
        "metadata": {"test": True}
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/research/submit",
            json=test_query,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            workflow_id = data.get("workflow_id")
            if workflow_id and data.get("status") and data.get("message"):
                print(f"✅ Research submit test passed: {workflow_id}")
                return True, workflow_id
            else:
                print(f"❌ Research submit returned unexpected data: {data}")
                return False, ""
        else:
            print(f"❌ Research submit failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False, ""
            
    except requests.RequestException as e:
        print(f"❌ Research submit test failed: {e}")
        return False, ""

def test_workflow_status_endpoint(workflow_id: str) -> bool:
    """Test the workflow status endpoint."""
    print("🧪 Testing workflow status endpoint...")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/workflow/{workflow_id}/status",
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if (data.get("workflow_id") and 
                data.get("status") and 
                "progress_percentage" in data):
                print(f"✅ Workflow status test passed: {data['status']} ({data['progress_percentage']}%)")
                return True
            else:
                print(f"❌ Workflow status returned unexpected data: {data}")
                return False
        else:
            print(f"❌ Workflow status failed: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Workflow status test failed: {e}")
        return False

def test_validation() -> bool:
    """Test input validation with invalid data."""
    print("🧪 Testing validation with invalid data...")
    
    invalid_query = {
        "query": "hi",  # Too short
        "user_id": "",  # Empty
        "priority": 10  # Out of range
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/research/submit",
            json=invalid_query,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 422:
            error_data = response.json()
            print("✅ Validation test passed (correctly rejected invalid data)")
            print(f"   Validation errors: {len(error_data.get('detail', []))} errors found")
            return True
        else:
            print(f"❌ Validation test failed: expected 422, got {response.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Validation test failed: {e}")
        return False

def main():
    """Run all API integration tests."""
    print("🚀 Starting API Integration Tests for Quanta AI Scientist\n")
    
    # Test results
    results = []
    workflow_id = ""
    
    # Run tests
    results.append(test_health_endpoint())
    print()
    
    submit_result, workflow_id = test_research_submit_endpoint()
    results.append(submit_result)
    print()
    
    if workflow_id:
        results.append(test_workflow_status_endpoint(workflow_id))
        print()
    else:
        print("⚠️  Skipping workflow status test (no workflow ID)")
        results.append(False)
        print()
    
    results.append(test_validation())
    print()
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All API integration tests passed!")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()