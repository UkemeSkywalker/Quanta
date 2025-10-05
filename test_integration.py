#!/usr/bin/env python3
"""
Simple integration test to verify the setup works
"""
import sys
import os
import requests
import time
import subprocess
import signal
from threading import Thread

# Add backend to path
sys.path.insert(0, 'backend')

def test_backend_startup():
    """Test that the backend starts up correctly"""
    print("Testing backend startup...")
    
    # Start the backend server in a subprocess
    env = os.environ.copy()
    env['PYTHONPATH'] = 'backend'
    
    process = subprocess.Popen([
        'backend/venv/bin/python', 
        'backend/run_dev.py'
    ], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait a moment for server to start
    time.sleep(3)
    
    try:
        # Test health endpoint
        response = requests.get('http://localhost:8000/health', timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        print("✓ Backend health check passed")
        
        # Test research submission endpoint
        test_query = {
            "query": "Test research query",
            "user_id": "test_user",
            "priority": 1
        }
        
        response = requests.post(
            'http://localhost:8000/api/research/submit',
            json=test_query,
            timeout=5
        )
        assert response.status_code == 200
        data = response.json()
        assert 'workflow_id' in data
        assert data['status'] == 'initiated'
        print("✓ Research submission endpoint works")
        
        print("✓ All backend tests passed!")
        
    except Exception as e:
        print(f"✗ Backend test failed: {e}")
        return False
    finally:
        # Clean up the process
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
    
    return True

def test_frontend_build():
    """Test that the frontend builds correctly"""
    print("Testing frontend build...")
    
    try:
        result = subprocess.run([
            'npm', 'run', 'build'
        ], cwd='frontend', capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✓ Frontend builds successfully")
            return True
        else:
            print(f"✗ Frontend build failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"✗ Frontend build test failed: {e}")
        return False

if __name__ == "__main__":
    print("Running integration tests...\n")
    
    backend_ok = test_backend_startup()
    frontend_ok = test_frontend_build()
    
    if backend_ok and frontend_ok:
        print("\n🎉 All tests passed! The project setup is working correctly.")
        print("\nTo start development:")
        print("  npm run dev")
        print("\nThis will start both frontend (localhost:3000) and backend (localhost:8000)")
    else:
        print("\n❌ Some tests failed. Please check the setup.")
        sys.exit(1)