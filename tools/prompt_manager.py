"""
Prompt Manager for ChatGPT API Call System
Centralized management of all prompt templates
"""

import os
import yaml
from typing import Dict, Any, Optional
import sys

# Add config directory to path to import prompt templates
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config'))
from prompt_templates import PromptTemplates

class PromptManager:
    """
    Centralized prompt template management system
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the prompt manager
        
        Args:
            config_path (str, optional): Path to the prompt configuration file
        """
        self.config_path = config_path or os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'config', 
            'prompt_config.yaml'
        )
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Load configuration from YAML file
        
        Returns:
            dict: Configuration dictionary
        """
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r', encoding='utf-8') as file:
                    config = yaml.safe_load(file)
                    print(f"Loaded prompt configuration from {self.config_path}")
                    return config or {}
            else:
                print(f"Configuration file not found at {self.config_path}, using defaults")
                return {}
        except Exception as e:
            print(f"Error loading prompt configuration: {e}, using defaults")
            return {}
    
    def get_intent_detection_prompt(self, user_input):
        """
        Get the intent detection prompt for determining if user wants image generation
        
        Args:
            user_input (str): The user's input text
            
        Returns:
            str: Formatted intent detection prompt
        """
        return PromptTemplates.get_intent_detection_prompt(user_input)
    
    def get_system_prompts(self):
        """
        Get system-level prompts for different scenarios
        
        Returns:
            dict: Dictionary of system prompts
        """
        # Load from template file
        template_prompts = PromptTemplates.SYSTEM_PROMPTS.copy()
        
        # Load from config file and merge if available
        config_prompts = self.config.get('system_prompts', {})
        template_prompts.update(config_prompts)
        
        return template_prompts
    
    def get_vision_prompt_template(self):
        """
        Get prompt template for vision/image understanding tasks
        
        Returns:
            str: Vision prompt template
        """
        return PromptTemplates.VISION_PROMPT_TEMPLATE
    
    def get_dalle_prompt_enhancement_template(self, original_prompt):
        """
        Get template for enhancing DALL-E prompts
        
        Args:
            original_prompt (str): Original user prompt for image generation
            
        Returns:
            str: Enhanced prompt template
        """
        return PromptTemplates.get_dalle_enhancement_prompt(original_prompt)
    
    def get_error_response_templates(self):
        """
        Get standardized error response templates
        
        Returns:
            dict: Dictionary of error responses
        """
        # Load from template file
        template_errors = PromptTemplates.ERROR_RESPONSES.copy()
        
        # Load from config file and merge if available
        config_errors = self.config.get('error_responses', {})
        template_errors.update(config_errors)
        
        return template_errors
    
    def get_validation_prompts(self):
        """
        Get prompts for content validation and safety checks
        
        Returns:
            dict: Dictionary of validation prompts
        """
        return {
            'content_safety': PromptTemplates.CONTENT_SAFETY_PROMPT,
            'prompt_injection_check': PromptTemplates.PROMPT_INJECTION_CHECK
        }
    
    def get_content_safety_prompt(self, content):
        """
        Get formatted content safety prompt
        
        Args:
            content (str): Content to analyze for safety
            
        Returns:
            str: Formatted safety prompt
        """
        return PromptTemplates.get_content_safety_prompt(content)
    
    def get_prompt_injection_check(self, user_input):
        """
        Get formatted prompt injection check
        
        Args:
            user_input (str): User input to check for injection attempts
            
        Returns:
            str: Formatted injection check prompt
        """
        return PromptTemplates.get_prompt_injection_check(user_input)
    
    def get_voice_interaction_prompts(self):
        """
        Get voice interaction prompts
        
        Returns:
            dict: Dictionary of voice interaction prompts
        """
        return PromptTemplates.VOICE_INTERACTION_PROMPTS
    
    def get_help_prompts(self):
        """
        Get help and guidance prompts
        
        Returns:
            dict: Dictionary of help prompts
        """
        return PromptTemplates.HELP_PROMPTS
    
    def get_domain_prompts(self):
        """
        Get specialized domain prompts
        
        Returns:
            dict: Dictionary of domain-specific prompts
        """
        return PromptTemplates.DOMAIN_PROMPTS
    
    def get_conversation_flow_prompts(self):
        """
        Get conversation flow prompts
        
        Returns:
            dict: Dictionary with conversation starters and enders
        """
        return {
            'starters': PromptTemplates.CONVERSATION_STARTER_PROMPTS,
            'enders': PromptTemplates.CONVERSATION_ENDERS
        }
    
    def update_prompt_template(self, template_name, new_template):
        """
        Update a specific prompt template (for future extensibility)
        Note: Currently this updates the config file, not the template file itself
        
        Args:
            template_name (str): Name of the template to update
            new_template (str): New template content
        """
        # For now, update in config to override template defaults
        if template_name in ['system_prompt', 'error_response']:
            print(f"Template update requested for {template_name}")
            # This could be extended to update YAML config file
        else:
            print(f"Template {template_name} is managed in prompt_templates.py")
            print("Please edit the template file directly for permanent changes")
    
    def get_all_templates(self):
        """
        Get all available prompt templates from PromptTemplates class
        
        Returns:
            dict: Dictionary containing all template categories
        """
        return PromptTemplates.get_all_templates()
    
    def get_template_names(self):
        """
        Get a list of all available template category names
        
        Returns:
            list: List of available template names
        """
        return [
            'intent_detection',
            'system_prompts', 
            'vision_prompt',
            'dalle_enhancement',
            'error_responses',
            'validation_prompts',
            'voice_prompts',
            'help_prompts',
            'domain_prompts',
            'conversation_flow'
        ]
    
    def get_config_value(self, key_path: str, default_value: Any = None) -> Any:
        """
        Get a configuration value using dot notation
        
        Args:
            key_path (str): Dot-separated path to the config value (e.g., 'tts_settings.default_voice')
            default_value (Any): Default value if key not found
            
        Returns:
            Any: Configuration value or default
        """
        keys = key_path.split('.')
        value = self.config
        
        try:
            for key in keys:
                value = value[key]
            return value
        except (KeyError, TypeError):
            return default_value
    
    def reload_config(self):
        """
        Reload configuration from file
        """
        self.config = self._load_config()
        print("Prompt configuration reloaded")
    
    def get_intent_detection_settings(self):
        """
        Get intent detection specific settings
        
        Returns:
            dict: Intent detection settings
        """
        return self.config.get('intent_detection', {
            'confidence_threshold': 0.8,
            'fallback_to_text': True,
            'debug_logging': True
        })
    
    def get_tts_settings(self):
        """
        Get TTS specific settings
        
        Returns:
            dict: TTS settings
        """
        return self.config.get('tts_settings', {
            'default_voice': 'alloy',
            'available_voices': ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
            'speed': 1.0,
            'response_format': 'mp3'
        })
    
    def get_dalle_settings(self):
        """
        Get DALL-E specific settings
        
        Returns:
            dict: DALL-E settings
        """
        return self.config.get('dalle_settings', {
            'default_size': '1024x1024',
            'default_quality': 'standard',
            'prompt_enhancement': True,
            'safety_filter': True
        }) 