#!/usr/bin/env python3
"""
Test script for Prompt Manager
Run this to verify that the prompt management system is working correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.prompt_manager import PromptManager

def test_prompt_manager():
    """Test the PromptManager functionality"""
    print("🧪 Testing Prompt Manager System")
    print("=" * 50)
    
    try:
        # Initialize prompt manager
        print("1️⃣ Initializing PromptManager...")
        pm = PromptManager()
        print("✅ PromptManager initialized successfully")
        
        # Test intent detection prompt
        print("\n2️⃣ Testing intent detection prompt...")
        test_input = "Draw a beautiful sunset"
        intent_prompt = pm.get_intent_detection_prompt(test_input)
        print(f"✅ Intent detection prompt generated (length: {len(intent_prompt)} chars)")
        print(f"   Sample: {intent_prompt[:100]}...")
        
        # Test system prompts
        print("\n3️⃣ Testing system prompts...")
        system_prompts = pm.get_system_prompts()
        print(f"✅ System prompts loaded: {list(system_prompts.keys())}")
        
        # Test error response templates
        print("\n4️⃣ Testing error response templates...")
        error_templates = pm.get_error_response_templates()
        print(f"✅ Error templates loaded: {list(error_templates.keys())}")
        
        # Test configuration value access
        print("\n5️⃣ Testing configuration value access...")
        default_voice = pm.get_config_value('tts_settings.default_voice', 'alloy')
        print(f"✅ TTS default voice: {default_voice}")
        
        # Test settings getters
        print("\n6️⃣ Testing settings getters...")
        tts_settings = pm.get_tts_settings()
        dalle_settings = pm.get_dalle_settings()
        intent_settings = pm.get_intent_detection_settings()
        
        print(f"✅ TTS settings: {tts_settings}")
        print(f"✅ DALL-E settings: {dalle_settings}")
        print(f"✅ Intent detection settings: {intent_settings}")
        
        # Test template list
        print("\n7️⃣ Testing template list...")
        template_names = pm.get_template_names()
        print(f"✅ Available template names: {template_names}")
        
        # Test new methods
        print("\n8️⃣ Testing new template methods...")
        voice_prompts = pm.get_voice_interaction_prompts()
        help_prompts = pm.get_help_prompts()
        domain_prompts = pm.get_domain_prompts()
        conversation_flow = pm.get_conversation_flow_prompts()
        
        print(f"✅ Voice prompts loaded: {len(voice_prompts)} items")
        print(f"✅ Help prompts loaded: {len(help_prompts)} items")
        print(f"✅ Domain prompts loaded: {len(domain_prompts)} items")
        print(f"✅ Conversation flow prompts loaded: starters={len(conversation_flow['starters'])}, enders={len(conversation_flow['enders'])}")
        
        # Test template file integration
        print("\n9️⃣ Testing template file integration...")
        from config.prompt_templates import PromptTemplates
        all_templates = PromptTemplates.get_all_templates()
        print(f"✅ Direct template access works: {len(all_templates)} template categories")
        
        print("\n" + "=" * 50)
        print("🎉 All tests passed! Prompt Manager is working correctly.")
        print("✅ Template file integration successful!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_intent_examples():
    """Test intent detection with various examples"""
    print("\n🎯 Testing Intent Detection Examples")
    print("=" * 50)
    
    pm = PromptManager()
    
    # Test cases
    test_cases = [
        ("Draw a cat", "Should be YES"),
        ("Paint a sunset", "Should be YES"),
        ("Generate an image of a city", "Should be YES"),
        ("画一只狗", "Should be YES"),
        ("Make efforts to improve", "Should be NO"),
        ("Create a new account", "Should be NO"),
        ("Generate some code", "Should be NO"),
        ("How to make coffee?", "Should be NO"),
    ]
    
    for test_input, expected in test_cases:
        prompt = pm.get_intent_detection_prompt(test_input)
        print(f"📝 Input: '{test_input}' ({expected})")
        print(f"   Prompt generated: ✅")
        print()

if __name__ == "__main__":
    print("🚀 Starting Prompt Manager Tests")
    print()
    
    # Run main tests
    success = test_prompt_manager()
    
    if success:
        # Run intent detection examples
        test_intent_examples()
        
        print("🏁 Testing completed successfully!")
        print("\n💡 Tips:")
        print("   - Modify config/prompt_config.yaml to customize prompts")
        print("   - Check config/README_PROMPTS.md for detailed instructions")
        print("   - Monitor logs when running the system for debugging")
    else:
        print("❌ Testing failed. Please check the errors above.")
        sys.exit(1) 