// Simple API integration test
// This can be run manually to verify API connectivity

import { ResearchQuery } from '../types/models';

// Test configuration
const API_BASE_URL = 'http://localhost:8000';

// Test data
const testQuery: ResearchQuery = {
    query: 'Analyze the impact of artificial intelligence on scientific research productivity',
    user_id: 'test_user_123',
    priority: 3,
    metadata: { test: true }
};

// Test functions
export async function testHealthEndpoint(): Promise<boolean> {
    try {
        console.log('Testing health endpoint...');
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
            console.error(`Health check failed: ${response.status} ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        console.log('Health check response:', data);

        if (data.status === 'healthy' && data.service === 'quanta-api') {
            console.log('✅ Health endpoint test passed');
            return true;
        } else {
            console.error('❌ Health endpoint returned unexpected data');
            return false;
        }
    } catch (error) {
        console.error('❌ Health endpoint test failed:', error);
        return false;
    }
}

export async function testResearchSubmitEndpoint(): Promise<boolean> {
    try {
        console.log('Testing research submit endpoint...');
        const response = await fetch(`${API_BASE_URL}/api/research/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testQuery),
        });

        if (!response.ok) {
            console.error(`Research submit failed: ${response.status} ${response.statusText}`);
            const errorData = await response.json().catch(() => ({}));
            console.error('Error details:', errorData);
            return false;
        }

        const data = await response.json();
        console.log('Research submit response:', data);

        if (data.workflow_id && data.status && data.message) {
            console.log('✅ Research submit endpoint test passed');
            return true;
        } else {
            console.error('❌ Research submit endpoint returned unexpected data');
            return false;
        }
    } catch (error) {
        console.error('❌ Research submit endpoint test failed:', error);
        return false;
    }
}

export async function testWorkflowStatusEndpoint(workflowId: string): Promise<boolean> {
    try {
        console.log('Testing workflow status endpoint...');
        const response = await fetch(`${API_BASE_URL}/api/workflow/${workflowId}/status`);

        if (!response.ok) {
            console.error(`Workflow status failed: ${response.status} ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        console.log('Workflow status response:', data);

        if (data.workflow_id && data.status && data.progress_percentage !== undefined) {
            console.log('✅ Workflow status endpoint test passed');
            return true;
        } else {
            console.error('❌ Workflow status endpoint returned unexpected data');
            return false;
        }
    } catch (error) {
        console.error('❌ Workflow status endpoint test failed:', error);
        return false;
    }
}

export async function testInvalidQueryValidation(): Promise<boolean> {
    try {
        console.log('Testing validation with invalid query...');
        const invalidQuery = {
            query: 'hi', // Too short
            user_id: '', // Empty
            priority: 10 // Out of range
        };

        const response = await fetch(`${API_BASE_URL}/api/research/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invalidQuery),
        });

        if (response.status === 422) {
            const errorData = await response.json();
            console.log('Validation error response:', errorData);
            console.log('✅ Validation test passed (correctly rejected invalid data)');
            return true;
        } else {
            console.error('❌ Validation test failed (should have returned 422)');
            return false;
        }
    } catch (error) {
        console.error('❌ Validation test failed:', error);
        return false;
    }
}

// Run all tests
export async function runAllTests(): Promise<void> {
    console.log('🧪 Starting API Integration Tests...\n');

    // First run basic tests
    const healthResult = await testHealthEndpoint();
    const submitResult = await testResearchSubmitEndpoint();
    
    // Get workflow ID from submit test for status test
    let workflowStatusResult = false;
    if (submitResult) {
        // Extract workflow ID from the last submit test (this is a simplified approach)
        const testQuery: ResearchQuery = {
            query: 'Analyze the impact of artificial intelligence on scientific research productivity',
            user_id: 'test_user_123',
            priority: 3,
            metadata: { test: true }
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/research/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testQuery),
            });
            const data = await response.json();
            workflowStatusResult = await testWorkflowStatusEndpoint(data.workflow_id);
        } catch (error) {
            console.error('Failed to get workflow ID for status test:', error);
        }
    }
    
    const validationResult = await testInvalidQueryValidation();

    const results = [healthResult, submitResult, workflowStatusResult, validationResult];
    const passed = results.filter(Boolean).length;
    const total = results.length;

    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('🎉 All API integration tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Check the logs above for details.');
    }
}

// Type for window extension
declare global {
    interface Window {
        apiTests?: {
            testHealthEndpoint: () => Promise<boolean>;
            testResearchSubmitEndpoint: () => Promise<boolean>;
            testInvalidQueryValidation: () => Promise<boolean>;
            runAllTests: () => Promise<void>;
        };
    }
}

// Export for manual testing
if (typeof window !== 'undefined') {
    // Browser environment - attach to window for manual testing
    window.apiTests = {
        testHealthEndpoint,
        testResearchSubmitEndpoint,
        testWorkflowStatusEndpoint,
        testInvalidQueryValidation,
        runAllTests
    };
}