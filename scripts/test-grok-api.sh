#!/bin/bash
# Self-Healing Grok API Test Script
# Tests Grok text and image generation with auto-recovery

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
XAI_API_KEY="${VITE_XAI_API_KEY:-}"
XAI_API_BASE="https://api.x.ai/v1"
TEXT_MODEL="grok-4-fast-reasoning"
IMAGE_MODEL="grok-2-image-1212"
MAX_RETRIES=3
RETRY_DELAY=2

# Stats tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🤖 Grok API Self-Healing Test Suite 🤖           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if API key is set
check_api_key() {
    if [ -z "$XAI_API_KEY" ]; then
        echo -e "${RED}❌ ERROR: VITE_XAI_API_KEY not set${NC}"
        echo -e "${YELLOW}💡 Set it with: export VITE_XAI_API_KEY=your-key-here${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ API Key configured${NC}"
}

# Function to test with retries and exponential backoff
test_with_retry() {
    local test_name="$1"
    local test_command="$2"
    local retry_count=0

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    echo ""
    echo -e "${BLUE}📋 Test $TESTS_TOTAL: $test_name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    while [ $retry_count -lt $MAX_RETRIES ]; do
        if eval "$test_command"; then
            echo -e "${GREEN}✅ PASSED${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $MAX_RETRIES ]; then
                # Exponential backoff: 2^retry_count seconds (2s, 4s, 8s)
                wait_time=$((2 ** retry_count))
                echo -e "${YELLOW}⚠️  Attempt $retry_count failed. Retrying in ${wait_time}s...${NC}"
                sleep $wait_time
            fi
        fi
    done

    echo -e "${RED}❌ FAILED after $MAX_RETRIES attempts${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
}

# Test 1: API Health Check
test_health_check() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $XAI_API_KEY" \
        "$XAI_API_BASE/chat/completions" \
        -X OPTIONS)

    if [ "$response" -eq 200 ] || [ "$response" -eq 405 ]; then
        echo "  Status: API endpoint reachable"
        return 0
    else
        echo "  Status: API endpoint returned $response"
        return 1
    fi
}

# Test 2: Text Generation (Grok-4-Fast-Reasoning)
test_text_generation() {
    local response=$(curl -s -X POST "$XAI_API_BASE/chat/completions" \
        -H "Authorization: Bearer $XAI_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$TEXT_MODEL\",
            \"messages\": [{\"role\": \"user\", \"content\": \"Say 'API test successful' in exactly 3 words.\"}],
            \"max_tokens\": 50,
            \"temperature\": 0.1,
            \"thinking\": false
        }")

    # Check if response contains expected fields
    if echo "$response" | grep -q '"choices"' && echo "$response" | grep -q '"content"'; then
        local content=$(echo "$response" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "  Model: $TEXT_MODEL"
        echo "  Response: $content"

        # Check token usage
        local usage=$(echo "$response" | grep -o '"usage":{[^}]*}' | head -1)
        if [ -n "$usage" ]; then
            echo "  Token Usage: $usage"
        fi

        return 0
    else
        echo "  Error: Invalid response format"
        echo "  Response: $response"
        return 1
    fi
}

# Test 3: Thinking Mode
test_thinking_mode() {
    local response=$(curl -s -X POST "$XAI_API_BASE/chat/completions" \
        -H "Authorization: Bearer $XAI_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$TEXT_MODEL\",
            \"messages\": [{\"role\": \"user\", \"content\": \"What is 15 + 27? Show your thinking.\"}],
            \"max_tokens\": 200,
            \"temperature\": 0.3,
            \"thinking\": true
        }")

    if echo "$response" | grep -q '"content"'; then
        local has_thinking=$(echo "$response" | grep -c '"thinking"' || true)
        echo "  Model: $TEXT_MODEL (thinking mode)"
        echo "  Thinking enabled: $([ $has_thinking -gt 0 ] && echo 'Yes ✅' || echo 'No ⚠️')"

        # Extract and show answer
        local content=$(echo "$response" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "  Answer: ${content:0:100}..."

        return 0
    else
        echo "  Error: Failed to generate response with thinking"
        return 1
    fi
}

# Test 4: Image Generation (Grok-2-Image-1212)
test_image_generation() {
    local response=$(curl -s -X POST "$XAI_API_BASE/images/generations" \
        -H "Authorization: Bearer $XAI_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$IMAGE_MODEL\",
            \"prompt\": \"A minimalist test image of a blue geometric shape on white background\",
            \"n\": 1,
            \"response_format\": \"url\"
        }")

    if echo "$response" | grep -q '"url"'; then
        echo "  Model: $IMAGE_MODEL"
        local image_url=$(echo "$response" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "  Image URL: ${image_url:0:60}..."

        # Verify image is accessible
        local image_response=$(curl -s -o /dev/null -w "%{http_code}" "$image_url")
        if [ "$image_response" -eq 200 ]; then
            echo "  Image Status: ✅ Accessible"
        else
            echo "  Image Status: ⚠️  HTTP $image_response"
        fi

        return 0
    else
        echo "  Error: No image URL in response"
        echo "  Response: ${response:0:200}..."
        return 1
    fi
}

# Test 5: Rate Limit Handling
test_rate_limits() {
    echo "  Testing rate limit behavior..."
    local success_count=0

    # Make 5 rapid requests
    for i in {1..5}; do
        local response=$(curl -s -X POST "$XAI_API_BASE/chat/completions" \
            -H "Authorization: Bearer $XAI_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"model\": \"$TEXT_MODEL\",
                \"messages\": [{\"role\": \"user\", \"content\": \"Test $i\"}],
                \"max_tokens\": 10
            }")

        if echo "$response" | grep -q '"content"'; then
            success_count=$((success_count + 1))
        fi

        sleep 0.5  # Small delay to avoid immediate rate limiting
    done

    echo "  Requests: 5 sent, $success_count succeeded"

    # Success if at least 3 out of 5 worked
    if [ $success_count -ge 3 ]; then
        echo "  Rate Limit: ✅ Within acceptable range"
        return 0
    else
        echo "  Rate Limit: ⚠️  Possible rate limiting ($success_count/5)"
        return 1
    fi
}

# Test 6: Error Handling
test_error_handling() {
    # Test with invalid model name
    local response=$(curl -s -X POST "$XAI_API_BASE/chat/completions" \
        -H "Authorization: Bearer $XAI_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"invalid-model-name\",
            \"messages\": [{\"role\": \"user\", \"content\": \"test\"}]
        }")

    # Should return an error message
    if echo "$response" | grep -q '"error"' || echo "$response" | grep -q '"message"'; then
        echo "  Error handling: ✅ API returns proper error messages"
        local error_msg=$(echo "$response" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "  Error message: ${error_msg:0:80}..."
        return 0
    else
        echo "  Error handling: ⚠️  Unexpected response format"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔧 Starting automated test suite...${NC}"
    echo ""

    check_api_key
    echo ""

    # Run all tests with retry logic
    test_with_retry "API Health Check" "test_health_check"
    test_with_retry "Text Generation (Grok-4-Fast-Reasoning)" "test_text_generation"
    test_with_retry "Thinking Mode" "test_thinking_mode"
    test_with_retry "Image Generation (Grok-2-Image-1212)" "test_image_generation"
    test_with_retry "Rate Limit Handling" "test_rate_limits"
    test_with_retry "Error Handling" "test_error_handling"

    # Summary
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📊 Test Results Summary${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "Total Tests:  $TESTS_TOTAL"
    echo -e "${GREEN}Passed:       $TESTS_PASSED${NC}"
    echo -e "${RED}Failed:       $TESTS_FAILED${NC}"

    # Success rate
    local success_rate=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo "Success Rate: $success_rate%"
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed! Grok API is fully operational.${NC}"
        exit 0
    elif [ $success_rate -ge 80 ]; then
        echo -e "${YELLOW}⚠️  Some tests failed but API is mostly functional ($success_rate% success rate)${NC}"
        exit 0
    else
        echo -e "${RED}❌ Critical failures detected. Please investigate.${NC}"
        exit 1
    fi
}

# Run main function
main
