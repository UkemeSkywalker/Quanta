"""
Agent Factory for creating and managing Strands agents.

This module provides the AgentFactory class that creates specialized agents
for the Quanta research workflow system.
"""

from typing import Dict, Any, Optional
from strands import Agent
from strands.models import BedrockModel


class AgentFactory:
    """Factory class for creating and managing specialized Strands agents."""
    
    def __init__(self, model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"):
        """
        Initialize the AgentFactory.
        
        Args:
            model_id: The model ID to use for all agents (defaults to Claude 3.5 Sonnet)
        """
        self.model_id = model_id
        self._agents: Dict[str, Agent] = {}
        
    def create_research_agent(self) -> Agent:
        """
        Create a Research Agent specialized in discovering data sources and research information.
        
        Returns:
            Agent: Configured research agent
        """
        if "research" not in self._agents:
            system_prompt = """You are a research specialist focused on discovering relevant data sources and research information.

Your primary responsibilities:
- Search for and identify relevant data sources, APIs, and datasets
- Validate data source URLs and accessibility
- Extract key research papers and literature
- Summarize research findings and data source recommendations
- Provide context and metadata about discovered sources

You should be thorough in your research and provide clear, actionable recommendations for data collection."""

            self._agents["research"] = Agent(
                model=BedrockModel(model_id=self.model_id),
                system_prompt=system_prompt,
                name="Research Agent",
                description="Specialized agent for discovering data sources and research information",
                agent_id="research_agent",
                callback_handler=None  # Disable default printing for cleaner output
            )
            
        return self._agents["research"]
    
    def create_data_agent(self) -> Agent:
        """
        Create a Data Agent specialized in fetching and processing data.
        
        Returns:
            Agent: Configured data agent
        """
        if "data" not in self._agents:
            system_prompt = """You are a data processing specialist focused on fetching and analyzing data from various sources.

Your primary responsibilities:
- Fetch data from URLs and APIs provided by the Research Agent
- Process CSV, JSON, and other data formats
- Perform basic statistical calculations (mean, median, standard deviation)
- Clean and validate data quality
- Transform data into suitable formats for analysis
- Identify patterns and preliminary insights in the data

You should be methodical in your data processing and provide clear summaries of the data characteristics and quality."""

            self._agents["data"] = Agent(
                model=BedrockModel(model_id=self.model_id),
                system_prompt=system_prompt,
                name="Data Agent",
                description="Specialized agent for fetching and processing data",
                agent_id="data_agent",
                callback_handler=None
            )
            
        return self._agents["data"]
    
    def create_experiment_agent(self) -> Agent:
        """
        Create an Experiment Agent specialized in designing and running experiments.
        
        Returns:
            Agent: Configured experiment agent
        """
        if "experiment" not in self._agents:
            system_prompt = """You are an experiment design specialist focused on testing hypotheses and discovering insights.

Your primary responsibilities:
- Design appropriate experiments using available data
- Simulate A/B tests and statistical analyses
- Perform hypothesis testing and significance testing
- Conduct correlation analysis and trend detection
- Generate experimental results and statistical summaries
- Provide insights and recommendations based on experimental findings

You should be rigorous in your experimental approach and provide statistically sound conclusions."""

            self._agents["experiment"] = Agent(
                model=BedrockModel(model_id=self.model_id),
                system_prompt=system_prompt,
                name="Experiment Agent",
                description="Specialized agent for designing and running experiments",
                agent_id="experiment_agent",
                callback_handler=None
            )
            
        return self._agents["experiment"]
    
    def create_critic_agent(self) -> Agent:
        """
        Create a Critic Agent specialized in validating results and methodology.
        
        Returns:
            Agent: Configured critic agent
        """
        if "critic" not in self._agents:
            system_prompt = """You are a critical analysis specialist focused on validating research methodology and results.

Your primary responsibilities:
- Review and validate research methodologies
- Identify potential biases and limitations in data and analysis
- Check result consistency and statistical validity
- Provide quality scores and confidence assessments
- Generate constructive feedback and improvement suggestions
- Ensure research meets scientific standards

You should be thorough and objective in your critiques, providing balanced assessments that help improve research quality."""

            self._agents["critic"] = Agent(
                model=BedrockModel(model_id=self.model_id),
                system_prompt=system_prompt,
                name="Critic Agent",
                description="Specialized agent for validating results and methodology",
                agent_id="critic_agent",
                callback_handler=None
            )
            
        return self._agents["critic"]
    
    def create_visualization_agent(self) -> Agent:
        """
        Create a Visualization Agent specialized in creating charts and reports.
        
        Returns:
            Agent: Configured visualization agent
        """
        if "visualization" not in self._agents:
            system_prompt = """You are a visualization specialist focused on creating clear and informative charts and reports.

Your primary responsibilities:
- Generate appropriate charts and graphs from research data
- Create comprehensive HTML reports summarizing findings
- Design visualizations that effectively communicate insights
- Combine results from all previous agents into cohesive presentations
- Ensure visualizations are accessible and well-formatted
- Provide clear explanations and interpretations of visual data

You should focus on clarity and effectiveness in your visualizations, making complex data understandable to various audiences."""

            self._agents["visualization"] = Agent(
                model=BedrockModel(model_id=self.model_id),
                system_prompt=system_prompt,
                name="Visualization Agent",
                description="Specialized agent for creating charts and reports",
                agent_id="visualization_agent",
                callback_handler=None
            )
            
        return self._agents["visualization"]
    
    def get_agent(self, agent_type: str) -> Optional[Agent]:
        """
        Get an existing agent by type.
        
        Args:
            agent_type: Type of agent ("research", "data", "experiment", "critic", "visualization")
            
        Returns:
            Agent: The requested agent, or None if not found
        """
        return self._agents.get(agent_type)
    
    def get_all_agents(self) -> Dict[str, Agent]:
        """
        Get all created agents.
        
        Returns:
            Dict[str, Agent]: Dictionary of all agents keyed by type
        """
        return self._agents.copy()
    
    def get_agent_status(self, agent_type: str) -> Dict[str, Any]:
        """
        Get the status of a specific agent.
        
        Args:
            agent_type: Type of agent to check
            
        Returns:
            Dict[str, Any]: Agent status information
        """
        agent = self._agents.get(agent_type)
        if not agent:
            return {
                "agent_type": agent_type,
                "status": "not_created",
                "name": None,
                "description": None
            }
        
        return {
            "agent_type": agent_type,
            "status": "ready",
            "name": agent.name,
            "description": agent.description,
            "agent_id": agent.agent_id,
            "model_id": self.model_id,
            "message_count": len(agent.messages)
        }
    
    def get_all_agent_statuses(self) -> Dict[str, Dict[str, Any]]:
        """
        Get status information for all agent types.
        
        Returns:
            Dict[str, Dict[str, Any]]: Status information for all agents
        """
        agent_types = ["research", "data", "experiment", "critic", "visualization"]
        return {
            agent_type: self.get_agent_status(agent_type)
            for agent_type in agent_types
        }