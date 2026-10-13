// Inline jargon glossary — used by the tooltip system across all components.
// Keys are lowercase; the tooltip engine does a case-insensitive scan.

export const GLOSSARY = {
  "apt":           "Advanced Persistent Threat — a sophisticated, long-running attack by a skilled adversary, often state-sponsored.",
  "c2":            "Command & Control — the server the attacker uses to send instructions to malware installed on victim machines.",
  "c&c":           "Command & Control — the server the attacker uses to send instructions to malware installed on victim machines.",
  "lsass":         "Local Security Authority Subsystem Service — a Windows process that stores logged-in users' password hashes in memory.",
  "ntlm":          "NT LAN Manager — a Windows authentication protocol that stores password hashes attackers can steal and reuse without knowing the actual password.",
  "kerberos":      "A network authentication protocol used in Windows Active Directory; attackers can forge 'tickets' to impersonate users.",
  "smb":           "Server Message Block — a Windows file-sharing protocol (port 445) commonly abused for lateral movement.",
  "pass-the-hash": "An attack where the stolen NTLM password hash is reused directly to log in — no need to crack the actual password.",
  "soar":          "Security Orchestration, Automation & Response — software that automates incident response actions like isolating a machine.",
  "edr":           "Endpoint Detection & Response — security software on each computer that monitors and blocks suspicious behaviour.",
  "siem":          "Security Information & Event Management — a central platform that collects logs from every system and triggers alerts.",
  "soc":           "Security Operations Centre — the team of analysts who monitor alerts and respond to attacks.",
  "mfa":           "Multi-Factor Authentication — requiring a second proof of identity (e.g. phone code) in addition to a password.",
  "vpn":           "Virtual Private Network — an encrypted tunnel into a corporate network, often targeted because it faces the internet.",
  "cve":           "Common Vulnerabilities & Exposures — a standardised ID for a known software vulnerability, e.g. CVE-2021-44228.",
  "rdp":           "Remote Desktop Protocol — a Windows protocol for remote GUI access, often exploited or used for lateral movement.",
  "amsi":          "Antimalware Scan Interface — a Windows API that allows antivirus to inspect scripts before execution; attackers try to disable it.",
  "uac":           "User Account Control — a Windows prompt that asks for admin permission; attackers try to bypass it silently.",
  "lateral movement": "Moving from one compromised machine to other machines inside the same network.",
  "kill chain":    "The sequential stages an attacker follows — from initial reconnaissance all the way to the final impact.",
  "payload":       "The malicious code the attacker delivers and executes on the victim's machine.",
  "beacon":        "A small piece of malware that repeatedly 'phones home' to the attacker's C2 server to receive new commands.",
  "privilege escalation": "The act of gaining higher permissions — e.g. moving from a standard user account to SYSTEM/root.",
  "exfiltration":  "Secretly copying stolen data out of the victim's network to attacker-controlled storage.",
  "persistence":   "Techniques that ensure the attacker's access survives reboots, log-offs, and password changes.",
  "iso":           "A disk image file format; attackers use it to bypass email attachment scanning.",
  "spn":           "Service Principal Name — an identifier for a Windows service account; attackers request its Kerberos ticket to crack offline.",
  "bloodhound":    "A tool that maps Active Directory relationships to find the fastest path to Domain Admin privileges.",
  "mimikatz":      "A popular credential-dumping tool that extracts password hashes directly from Windows memory.",
  "vss":           "Volume Shadow Service — Windows backup snapshots; ransomware deletes these to prevent recovery.",
  "domain controller": "The server that manages Windows authentication and group policies for an entire organisation.",
  "active directory": "Microsoft's directory service that manages users, computers, and permissions across a Windows network.",
  "zero trust":    "A security model that trusts nothing by default — every request must be verified regardless of network location.",
  "ttp":           "Tactics, Techniques & Procedures — the specific methods an attacker uses, catalogued in the MITRE ATT&CK framework.",
};

/**
 * Wrap known jargon terms in a text string with <span class="jargon-term"> tags
 * so the tooltip CSS/JS can pick them up.
 *
 * @param {string} text   - Plain text to scan
 * @param {boolean} first - If true, only wrap the first occurrence of each term
 * @returns {string}      - HTML string with jargon spans inserted
 */
export function wrapJargon(text, first = true) {
  if (!text) return text;
  const seen = new Set();

  // Sort keys longest-first to avoid partial matches on shorter substrings
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

  let result = text;
  for (const term of terms) {
    if (first && seen.has(term)) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
    if (regex.test(result)) {
      seen.add(term);
      result = result.replace(
        new RegExp(`\\b(${escaped})\\b`, "gi"),
        (match) => `<span class="jargon-term" data-term="${term.toLowerCase()}">${match}</span>`
      );
      // After the first match, skip further occurrences if first=true
      if (first) seen.add(term);
    }
  }
  return result;
}
