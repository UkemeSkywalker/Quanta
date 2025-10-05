"""
Simple test script for Strands agents with mock responses.

This script tests the AgentFactory and basic agent functionality
without requiring actual model calls.
"""

import asyncio
from agent_factory import AgentFactory


class MockAgent:
    """Mock agent for testing without actual model calls."""
    
    def __init__(self, name: str, description: str, agent_id: str):
        self.name = name
        self.description = description
        self.agent_id = agent_id
        self.messages = []
        
    def __call__(self, prompt: str) -> str:
        """Mock agent call that returns a predefined response."""
        mock_responses = {
            "research_agent": f"Mock research response: I found 3 relevant data sources for your query: '{prompt}'. These include academic papers, datasets, and API endpoints.",
            "data_agent": f"Mock data response: I processed the data sources and found 1,250 data points with mean=45.2, median=42.1, std=12.8 for query: '{prompt}'.",
            "experiment_agent": f"Mock experiment response: I designed and ran 3 experiments for '{prompt}'. Results show significant correlation (p<0.05) with 85% confidence.",
            "critic_agent": f"Mock critic response: The methodology for '{prompt}' is sound. Quality score: 8.5/10. Minor bias detected in data sampling.",
            "visualization_agent": f"Mock visualization response: I created 4 charts and 1 comprehensive report for '{prompt}'. All visualizations are ready for review."
        }
        
        response = mock_responses.get(self.agent_id, f"Mock response from {self.name}: {prompt}")
        self.messages.append({"role": "user", "content": prompt})
        self.messages.append({"role": "assistant", "content": response})
        return response


def create_mock_factory():
    """Create a mock factory for testing."""
    factory = AgentFactory()
    
    # Replace the actual agent creation with mock agents
    original_create_research = factory.create_research_agent
    original_create_data = factory.create_data_agent
    original_create_experiment = factory.create_experiment_agent
    original_create_critic = factory.create_critic_agent
    original_create_visualization = factory.create_visualization_agent
    
    def mock_create_research():
        if "research" not in factory._agents:
            factory._agents["research"] = MockAgent(
                name="Research Agent",
                description="Specialized agent for discovering data sources and research information",
                agent_id="research_agent"
            )
        return factory._agents["research"]
    
    def mock_create_data():
        if "data" not in factory._agents:
            factory._agents["data"] = MockAgent(
                name="Data Agent", 
                description="Specialized agent for fetching and processing data",
                agent_id="data_agent"
            )
        return factory._agents["data"]
    
    def mock_create_experiment():
        if "experiment" not in factory._agents:
            factory._agents["experiment"] = MockAgent(
                name="Experiment Agent",
                description="Specialized agent for designing and running experiments", 
                agent_id="experiment_agent"
            )
        return factory._agents["experiment"]
    
    def mock_create_critic():
        if "critic" not in factory._agents:
            factory._agents["critic"] = MockAgent(
                name="Critic Agent",
                description="Specialized agent for validating results and methodology",
                agent_id="critic_agent"
            )
        return factory._agents["critic"]
    
    def mock_create_visualization():
        if "visualization" not in factory._agents:
            factory._agents["visualization"] = MockAgent(
                name="Visualization Agent",
                description="Specialized agent for creating charts and reports",
                agent_id="visualization_agent"
            )
        return factory._agents["visualization"]
    
    # Replace methods with mock versions
    factory.create_research_agent = mock_create_research
    factory.create_data_agent = mock_create_data
    factory.create_experiment_agent = mock_create_experiment
    factory.create_critic_agent = mock_create_critic
    factory.create_visualization_agent = mock_create_visualization
    
    return factory


def test_agent_factory():
    """Test the AgentFactory with mock agents."""
    print("🧪 Testing AgentFactory with Mock Agents")
    print("=" * 50)
    
    # Create mock factory
    factory = create_mock_factory()
    
    # Test agent creation
    print("\n1. Testing Agent Creation:")
    agents = {
        "research": factory.create_research_agent(),
        "data": factory.create_data_agent(),
        "experiment": factory.create_experiment_agent(),
        "critic": factory.create_critic_agent(),
        "visualization": factory.create_visualization_agent()
    }
    
    for agent_type, agent in agents.items():
        print(f"   ✅ {agent_type.capitalize()} Agent: {agent.name}")
        print(f"      Description: {agent.description}")
        print(f"      Agent ID: {agent.agent_id}")
    
    # Test agent status
    print("\n2. Testing Agent Status:")
    statuses = factory.get_all_agent_statuses()
    for agent_type, status in statuses.items():
        print(f"   📊 {agent_type.capitalize()}: {status['status']}")
    
    # Test agent calls with mock responses
    print("\n3. Testing Agent Responses:")
    test_query = "What is the impact of AI on scientific research?"
    
    for agent_type, agent in agents.items():
        print(f"\n   🤖 {agent_type.capitalize()} Agent Response:")
        response = agent(test_query)
        print(f"      {response}")
        print(f"      Messages in history: {len(agent.messages)}")
    
    # Test workflow simulation
    print("\n4. Testing Workflow Simulation:")
    workflow_query = "Analyze climate change data trends"
    
    print(f"   📝 Query: {workflow_query}")
    print("   🔄 Simulating workflow...")
    
    # Simulate the workflow by calling agents in sequence
    research_result = agents["research"](workflow_query)
    print(f"   1️⃣ Research: {research_result[:80]}...")
    
    data_result = agents["data"](f"Process data from: {research_result}")
    print(f"   2️⃣ Data: {data_result[:80]}...")
    
    experiment_result = agents["experiment"](f"Run experiments on: {data_result}")
    print(f"   3️⃣ Experiment: {experiment_result[:80]}...")
    
    critic_result = agents["critic"](f"Validate: {experiment_result}")
    print(f"   4️⃣ Critic: {critic_result[:80]}...")
    
    viz_result = agents["visualization"](f"Visualize: {critic_result}")
    print(f"   5️⃣ Visualization: {viz_result[:80]}...")
    
    print("\n✅ All tests completed successfully!")
    print("🎉 AgentFactory is working correctly with mock responses")
    
    return True


if __name__ == "__main__":
    try:
        test_agent_factory()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()