#!/bin/bash

# Health Check and Monitoring Script for Veer Nirman
# This script monitors the health of both frontend and backend

set -e

echo "🔍 Veer Nirman Health Check"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check HTTP status
check_http_status() {
    local url=$1
    local expected_status=${2:-200}
    local timeout=${3:-10}
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $url - Status: $status${NC}"
        return 0
    else
        echo -e "${RED}❌ $url - Status: $status (Expected: $expected_status)${NC}"
        return 1
    fi
}

# Function to check response time
check_response_time() {
    local url=$1
    local max_time=${2:-2}
    
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$url" 2>/dev/null || echo "999")
    local response_time_ms=$(echo "$response_time * 1000" | bc -l 2>/dev/null || echo "999")
    local response_time_int=${response_time_ms%.*}
    
    if (( response_time_int < max_time * 1000 )); then
        echo -e "${GREEN}⚡ $url - Response time: ${response_time_int}ms${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $url - Response time: ${response_time_int}ms (Expected: <${max_time}000ms)${NC}"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1
    local expiry_days=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    
    if [ ! -z "$expiry_days" ]; then
        echo -e "${GREEN}🔒 SSL Certificate for $domain is valid${NC}"
        echo -e "${GREEN}   Expires: $expiry_days${NC}"
        return 0
    else
        echo -e "${RED}❌ SSL Certificate check failed for $domain${NC}"
        return 1
    fi
}

# Function to check Firebase hosting
check_firebase_hosting() {
    echo ""
    echo "🔥 Checking Firebase Hosting..."
    
    local frontend_url="https://veer-nirman.web.app"
    local backup_url="https://veer-nirman.firebaseapp.com"
    
    # Check main hosting URL
    if check_http_status "$frontend_url" 200 15; then
        check_response_time "$frontend_url" 3
        check_ssl "veer-nirman.web.app"
    else
        echo -e "${RED}❌ Main hosting URL failed${NC}"
    fi
    
    # Check backup URL
    if check_http_status "$backup_url" 200 15; then
        echo -e "${GREEN}✅ Backup URL is working${NC}"
    else
        echo -e "${YELLOW}⚠️  Backup URL failed${NC}"
    fi
}

# Function to check backend health
check_backend_health() {
    echo ""
    echo "🖥️  Checking Backend Health..."
    
    local backend_url="http://localhost:8000"
    
    # Check if backend is running locally
    if check_http_status "$backend_url/health" 200 5; then
        echo -e "${GREEN}✅ Backend is running locally${NC}"
        
        # Check API endpoints
        check_http_status "$backend_url/api/v1/health" 200 5
        check_http_status "$backend_url/docs" 200 5
        
        # Check response time
        check_response_time "$backend_url/health" 1
    else
        echo -e "${RED}❌ Backend is not running locally${NC}"
        echo -e "${YELLOW}💡 To start backend: cd backend && python -m uvicorn main:app --reload${NC}"
    fi
}

# Function to check dependencies
check_dependencies() {
    echo ""
    echo "📦 Checking Dependencies..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        echo -e "${GREEN}✅ Node.js: $node_version${NC}"
    else
        echo -e "${RED}❌ Node.js not found${NC}"
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        echo -e "${GREEN}✅ npm: $npm_version${NC}"
    else
        echo -e "${RED}❌ npm not found${NC}"
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version)
        echo -e "${GREEN}✅ Python: $python_version${NC}"
    else
        echo -e "${RED}❌ Python3 not found${NC}"
    fi
    
    # Check Firebase CLI
    if command -v firebase &> /dev/null; then
        local firebase_version=$(firebase --version)
        echo -e "${GREEN}✅ Firebase CLI: $firebase_version${NC}"
    else
        echo -e "${RED}❌ Firebase CLI not found${NC}"
    fi
}

# Function to check disk space
check_disk_space() {
    echo ""
    echo "💾 Checking Disk Space..."
    
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        echo -e "${GREEN}✅ Disk usage: ${disk_usage}%${NC}"
    elif [ "$disk_usage" -lt 90 ]; then
        echo -e "${YELLOW}⚠️  Disk usage: ${disk_usage}%${NC}"
    else
        echo -e "${RED}❌ Disk usage: ${disk_usage}% (Critical)${NC}"
    fi
}

# Function to generate health report
generate_health_report() {
    echo ""
    echo "📊 Health Report Summary"
    echo "========================"
    
    local report_file="health-report-$(date +%Y%m%d-%H%M%S).log"
    
    {
        echo "Veer Nirman Health Report"
        echo "Generated: $(date)"
        echo "========================"
        echo ""
        
        # System info
        echo "System Information:"
        echo "- OS: $(uname -s)"
        echo "- Hostname: $(hostname)"
        echo "- User: $(whoami)"
        echo "- PWD: $(pwd)"
        echo ""
        
        # Project info
        echo "Project Information:"
        echo "- Project: Veer Nirman NCC Training Platform"
        echo "- Version: 2.0.0"
        echo "- Environment: Production"
        echo "- Frontend URL: https://veer-nirman.web.app"
        echo "- Backend URL: http://localhost:8000"
        echo ""
        
    } > "$report_file"
    
    echo -e "${GREEN}📄 Health report saved to: $report_file${NC}"
}

# Main health check function
main() {
    echo "Starting comprehensive health check..."
    
    check_dependencies
    check_disk_space
    check_firebase_hosting
    check_backend_health
    
    generate_health_report
    
    echo ""
    echo -e "${GREEN}🏁 Health check completed!${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Fix any issues marked with ❌"
    echo "2. Monitor response times for performance"
    echo "3. Check SSL certificate expiry regularly"
    echo "4. Deploy backend to production for full functionality"
    echo ""
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Health check interrupted by user${NC}"; exit 1' INT

# Run main function
main "$@"
