#!/bin/bash

# Function to insert the XML content into ossec_config section
insert_xml() {
  local agent=$1
  local level=$2
  local timeout=$3

  # Define the XML content with placeholders
  local xml_content="
  <active-response>
    <command>firewall-drop</command>
    <level>$level</level>
    <location>defined-agent</location>
    <agent_id>$agent</agent_id>
    <rules_group>authentication_failures,|syslog,|sshd,</rules_group>
    <timeout>$timeout</timeout>
  </active-response>"

  # Insert the XML content between <!--botresponse--> and <!--stopbot-->
  sudo awk -v xml_content="$xml_content" '
  BEGIN { found = 0 }
  /<!--botresponse-->/ { found = 1; print; print xml_content; next }
  { print }
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
insert_xml "$agent" "$level" "$timeout"

# Restart the Wazuh manager service
sudo systemctl restart wazuh-manager

echo "Configuration updated and Wazuh manager restarted."
