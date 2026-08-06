## SnapAV-WattBox

This module will allow you to control the WattBox family of devices using companion.

### Configuration

- The WattBox must be powered on and connected to the same network as the computer that is running Companion.
- This module controls the WattBox through REST on port 80 or Telnet on port 23.

#### Static Network Configuration (optional)

- For better performance and reliability, it is recommended that you assign the WattBox a static IP address. One way to accomplish this is to make a DHCP reservation on your router or DHCP server.

### To use the module

Add a button and choose the action you want to use.

**Available Actions:**

- Turn an outlet on the WattBox on or off.
- Rebooting outlet.
- Turning auto reboot on
- Turning auto reboot off
- Rename an outlet
- Set an outlet's mode (Normal, or Reset Only)

Outlet dropdowns are labelled with the names configured on the WattBox itself, so they read
"1: ATEM" rather than "Outlet 1". The labels appear once the module has read status from the
device and update on their own if you rename an outlet.

**Available Presets**

- Outlet On
- Outlet Off

**Available Feedbacks**

- Outlet On
- Outlet Off

**Available Variables**

- Outlet Name
- Outlet State
- Device Name
- Cloud Status
- Voltage
- Amperage
- Wattage
- Device Serial Number

### Tested Devices

- WattBox WB-300-IP-3 (Firmware: WB10.6c14) (REST)
- WB-250-IPW-2 (Telnet)

### Polling

Turn on **Enable Polling** if you want outlet names, states and power readings as variables and
feedbacks. Without it the module can still switch outlets, but it never reads anything back.

Leave the interval at 5000 ms unless you have a reason not to. A WattBox has a single threaded web
server, and polling faster than about a second makes it return empty or partial responses. The
module tolerates a few bad responses, then backs off and recovers on its own rather than giving up.

### Renaming outlets and setting outlet mode

These write to the WattBox's configuration rather than switching power, which needs a login session
in addition to the credentials used for everything else. The module handles that for you.

**Verified on the WB-300 series.** Other models may name their configuration fields differently. If
a rename does not take, the module reads the name back and logs a warning saying so, rather than
appearing to succeed. Switching outlets, status, variables and feedbacks are unaffected either way.

Note that outlet names cannot contain commas: the WattBox reports every name back in one comma
separated list, so a comma in a name corrupts the reading of every outlet after it. The module
replaces commas with spaces and tells you when it does.
