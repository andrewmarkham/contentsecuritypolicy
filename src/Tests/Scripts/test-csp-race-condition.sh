#!/bin/bash

# CSP nonce vs HTML script nonce checker

URL="https://localhost:5001/"
CONCURRENT_REQUESTS=50

different_nonce_count=0
iteration=0

echo "Starting CSP nonce vs HTML script nonce check (High Load - $CONCURRENT_REQUESTS concurrent requests)..."
echo ""

extract_nonce_from_csp() {
    local header_value="$1"
    if [[ -z "$header_value" ]]; then
        echo ""
        return
    fi
    
    if [[ $header_value =~ \'nonce-([a-zA-Z0-9_-]+)\' ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo ""
    fi
}

extract_nonce_from_first_script() {
    local html_content="$1"
    if [[ -z "$html_content" ]]; then
        echo ""
        return
    fi
    
    if [[ $html_content =~ \<script[^\>]+nonce[[:space:]]*=[[:space:]]*[\'\"]*([a-f0-9-]+) ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo ""
    fi
}

make_request() {
    local iteration=$1
    local request_number=$2
    
    # Create temp files for this request
    local temp_headers=$(mktemp)
    local temp_body=$(mktemp)
    
    # Make request with curl, ignoring SSL certificate validation
    if curl -s -k -D "$temp_headers" -o "$temp_body" "$URL" 2>/dev/null; then
        # Extract CSP header
        local csp=$(grep -i "^content-security-policy:" "$temp_headers" | sed 's/^[^:]*: *//' | tr -d '\r\n')
        local nonce_csp=$(extract_nonce_from_csp "$csp")
        
        # Extract HTML content
        local html_content=$(cat "$temp_body")
        local nonce_script=$(extract_nonce_from_first_script "$html_content")
        
        # Compare nonces
        if [[ -n "$nonce_csp" ]] && [[ "$nonce_csp" == "$nonce_script" ]]; then
            echo "[$iteration-$request_number] MATCH - $nonce_csp" | tee -a /tmp/csp_results_$$
        else
            echo "[$iteration-$request_number] MISMATCH" | tee -a /tmp/csp_results_$$
            echo "      CSP Nonce:    $nonce_csp" | tee -a /tmp/csp_results_$$
            echo "      Script Nonce: $nonce_script" | tee -a /tmp/csp_results_$$
            echo "MISMATCH" >> /tmp/csp_mismatches_$$
        fi
    else
        echo "[$iteration-$request_number] ERROR: Failed to connect" | tee -a /tmp/csp_results_$$
    fi
    
    # Clean up temp files
    rm -f "$temp_headers" "$temp_body"
}

export -f make_request
export -f extract_nonce_from_csp
export -f extract_nonce_from_first_script
export URL

while true; do
    ((iteration++))
    
    # Clear temp results files
    rm -f /tmp/csp_results_$$
    rm -f /tmp/csp_mismatches_$$
    touch /tmp/csp_results_$$
    touch /tmp/csp_mismatches_$$
    
    # Launch concurrent requests using background jobs
    for ((i=0; i<CONCURRENT_REQUESTS; i++)); do
        make_request $iteration $i &
    done
    
    # Wait for all background jobs to complete
    wait
    
    # Count mismatches from this iteration
    mismatches=$(wc -l < /tmp/csp_mismatches_$$ | tr -d ' ')
    different_nonce_count=$((different_nonce_count + mismatches))
    
    echo ""
    echo "Total different nonce count: $different_nonce_count"
    echo ""
    echo "─────────────────────────────────────────────────────────"
    echo ""
    
    # Clean up
    rm -f /tmp/csp_results_$$
    rm -f /tmp/csp_mismatches_$$
done