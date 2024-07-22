#!/bin/bash

# Function to remove the specific <active-response> section
remove_xml() {
  local agent=$1
  local level=$2
  local timeout=$3

  # Create a temporary file to store the modified configuration
  sudo awk -v agent_id="$agent" -v level="$level" -v timeout="$timeout" '
  BEGIN { in_block = 0 }
  {
    if ($0 ~ "<active-response>") {
      in_block = 1
      active_response = $0
      next
    }
    if (in_block) {
      active_response = active_response "\n" $0
      if ($0 ~ "</active-response>") {
        in_block = 0
        if (active_response ~ "<level>" level "</level>" && 
            active_response ~ "<agent_id>" agent_id "</agent_id>" && 
            active_response ~ "<timeout>" timeout "</timeout>") {
          active_response = ""
        } else {
          print active_response
        }
        next
      }
    }
    if (!in_block) {
      print
    }
  }
  ' /var/ossec/etc/ossec.conf > /tmp/ossec.conf

  # Move the new configuration back to the original location
  sudo mv /tmp/ossec.conf /var/ossec/etc/ossec.conf
}

# Check if the number of arguments is 3
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <AGENT_ID> <LEVEL> <TIMEOUT>"
    exit 1
fi

# Variabel input dari argumen
agent=$1
level=$2
timeout=$3

# Call the function with the user input
remove_xml "$agent" "$level" "$timeout"

# Restart the Wazuh manager service
sudo systemctl restart wazuh-manager

echo "Configuration updated and Wazuh manager restarted."
