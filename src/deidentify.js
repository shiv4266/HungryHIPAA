export function deidentifyText(input) {
  let text = input;
  const findings = [];
  const detectedNames = [];

  const nameLabelRules = [
    {
      label: "Patient Name",
      regex: /\b(Patient Name|Patient|Name)\s*:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
      placeholder: "[NAME]",
    },
    {
      label: "Provider Name",
      regex: /\b(Provider|Physician|Doctor)\s*:\s*((?:Dr\.\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
      placeholder: "[PROVIDER]",
    },
  ];
  
  const addressLabelRules = [
    {
      label: "Address",
      regex: /\b(Address)\s*:\s*(.+)/g,
      placeholder: "[ADDRESS]",
    },
  ];

  for (let i = 0; i < nameLabelRules.length; i += 1) {
    const rule = nameLabelRules[i];
    let match;
    const examples = [];

    while ((match = rule.regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const nameText = match[2];

      examples.push(fullMatch);

      if (rule.placeholder === "[NAME]") {
        detectedNames.push(nameText);
      }
    }

    if (examples.length > 0) {
      findings.push({
        type: rule.label,
        count: examples.length,
        examples: examples.slice(0, 3),
      });

      text = text.replace(rule.regex, function (_, labelText) {
        return labelText + ": " + rule.placeholder;
      });
    }
  }

  for (let i = 0; i < detectedNames.length; i += 1) {
    const fullName = detectedNames[i];
    const escapedName = escapeRegExp(fullName);
    const nameRegex = new RegExp("\\b" + escapedName + "\\b", "g");

    const matches = text.match(nameRegex);
    if (matches) {
      findings.push({
        type: "Repeated Patient Name",
        count: matches.length,
        examples: matches.slice(0, 3),
      });

      text = text.replace(nameRegex, "[NAME]");
    }
  }

  const rules = [
    {
      label: "Email",
      regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      replacement: "[EMAIL]",
    },
    {
      label: "Phone",
      regex: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}\b/g,
      replacement: "[PHONE]",
    },
    {
      label: "SSN",
      regex: /\b\d{3}-\d{2}-\d{4}\b/g,
      replacement: "[SSN]",
    },
    {
      label: "Date",
      regex:
        /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4})\b/gi,
      replacement: "[DATE]",
    },
    {
      label: "IP Address",
      regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      replacement: "[IP_ADDRESS]",
    },
    {
      label: "URL",
      regex: /\bhttps?:\/\/[^\s]+/gi,
      replacement: "[URL]",
    },
    {
      label: "MRN",
      regex: /\b(?:MRN|Medical Record Number)[:\s#-]*[A-Z0-9-]+\b/gi,
      replacement: "[MRN]",
    },
    {
      label: "Account Number",
      regex: /\b(?:Account|Acct)[\s#:.-]*\d+\b/gi,
      replacement: "[ACCOUNT_NUMBER]",
    },
    {
      label: "Street Address",
      regex: /\b\d{1,6}\s+[A-Za-z0-9.-]+\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Lane|Ln|Drive|Dr|Court|Ct|Way)\b\.?/gi,
      replacement: "[ADDRESS]",
    },
    {
      label: "City State ZIP",
      regex: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g,
      replacement: "[CITY_STATE_ZIP]",
    },
  ];
for (let i = 0; i < addressLabelRules.length; i += 1) {
  const rule = addressLabelRules[i];
  let match;
  const examples = [];

  while ((match = rule.regex.exec(text)) !== null) {
    const fullMatch = match[0];
    examples.push(fullMatch);
  }

  if (examples.length > 0) {
    findings.push({
      type: rule.label,
      count: examples.length,
      examples: examples.slice(0, 3),
    });

    text = text.replace(rule.regex, function (_, labelText) {
      return labelText + ": " + rule.placeholder;
    });
  }
}

  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i];
    const matches = text.match(rule.regex);

    if (matches) {
      findings.push({
        type: rule.label,
        count: matches.length,
        examples: matches.slice(0, 3),
      });

      text = text.replace(rule.regex, rule.replacement);
    }
  }

  return { text, findings };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeKey(key) {
  return String(key).trim().toLowerCase();
}

function addFinding(findingsMap, type, value) {
  if (!findingsMap[type]) {
    findingsMap[type] = [];
  }
  findingsMap[type].push(String(value));
}

function redactStructuredValue(key, value, findingsMap) {
  if (value === null || value === undefined) {
    return value;
  }

  const normalized = normalizeKey(key);

  const exactMap = {
    name: "[NAME]",
    first_name: "[NAME]",
    last_name: "[NAME]",
    lastname: "[NAME]",
    patient_name: "[NAME]",
    full_name: "[NAME]",
    dob: "[DOB]",
    date_of_birth: "[DOB]",
    birth_date: "[DOB]",
    phone: "[PHONE]",
    phone_number: "[PHONE]",
    mobile: "[PHONE]",
    email: "[EMAIL]",
    email_address: "[EMAIL]",
    ssn: "[SSN]",
    social_security_number: "[SSN]",
    mrn: "[MRN]",
    medical_record_number: "[MRN]",
    address: "[ADDRESS]",
    street_address: "[ADDRESS]",
    account: "[ACCOUNT_NUMBER]",
    account_number: "[ACCOUNT_NUMBER]",
  };

  if (exactMap[normalized]) {
    const placeholder = exactMap[normalized];
    const type = placeholder.replace("[", "").replace("]", "");
    addFinding(findingsMap, type, value);
    return placeholder;
  }

  if (normalized.indexOf("name") !== -1) {
    addFinding(findingsMap, "NAME", value);
    return "[NAME]";
  }

  if (normalized.indexOf("birth") !== -1 || normalized.indexOf("dob") !== -1) {
    addFinding(findingsMap, "DOB", value);
    return "[DOB]";
  }

  if (normalized.indexOf("phone") !== -1) {
    addFinding(findingsMap, "PHONE", value);
    return "[PHONE]";
  }

  if (normalized.indexOf("email") !== -1) {
    addFinding(findingsMap, "EMAIL", value);
    return "[EMAIL]";
  }

  if (normalized.indexOf("ssn") !== -1) {
    addFinding(findingsMap, "SSN", value);
    return "[SSN]";
  }

  if (normalized.indexOf("mrn") !== -1) {
    addFinding(findingsMap, "MRN", value);
    return "[MRN]";
  }

  if (normalized.indexOf("address") !== -1) {
    addFinding(findingsMap, "ADDRESS", value);
    return "[ADDRESS]";
  }

  if (normalized.indexOf("account") !== -1) {
    addFinding(findingsMap, "ACCOUNT_NUMBER", value);
    return "[ACCOUNT_NUMBER]";
  }

  return value;
}

function findingsMapToArray(findingsMap) {
  const output = [];
  const keys = Object.keys(findingsMap);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    output.push({
      type: key,
      count: findingsMap[key].length,
      examples: findingsMap[key].slice(0, 3),
    });
  }

  return output;
}

function combineFindings(findings) {
  const grouped = {};

  for (let i = 0; i < findings.length; i += 1) {
    const item = findings[i];

    if (!grouped[item.type]) {
      grouped[item.type] = {
        type: item.type,
        count: 0,
        examples: [],
      };
    }

    grouped[item.type].count += item.count;

    if (item.examples) {
      for (let j = 0; j < item.examples.length; j += 1) {
        if (grouped[item.type].examples.length < 3) {
          grouped[item.type].examples.push(item.examples[j]);
        }
      }
    }
  }

  return Object.values(grouped);
}

export function deidentifyJsonText(input) {
  const parsed = JSON.parse(input);
  const findingsMap = {};

  function walk(node) {
    if (Array.isArray(node)) {
      const arr = [];
      for (let i = 0; i < node.length; i += 1) {
        arr.push(walk(node[i]));
      }
      return arr;
    }

    if (node && typeof node === "object") {
      const output = {};
      const entries = Object.entries(node);

      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        const key = entry[0];
        const value = entry[1];

        if (value && typeof value === "object") {
          output[key] = walk(value);
        } else {
          output[key] = redactStructuredValue(key, value, findingsMap);
        }
      }

      return output;
    }

    return node;
  }

  const structuredRedacted = walk(parsed);
  const jsonText = JSON.stringify(structuredRedacted, null, 2);
  const textResult = deidentifyText(jsonText);

  const combined = findingsMapToArray(findingsMap).concat(textResult.findings);

  return {
    text: textResult.text,
    findings: combineFindings(combined),
  };
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function stripOuterQuotes(value) {
  if (typeof value !== "string") {
    return value;
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }

  return value;
}

function quoteIfNeeded(value) {
  if (typeof value !== "string") {
    return value;
  }

  if (/[",\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }

  return value;
}

export function deidentifyCsvText(input) {
  const lines = input.split(/\r?\n/);

  if (lines.length === 0) {
    return { text: input, findings: [] };
  }

  const findingsMap = {};
  const headers = splitCsvLine(lines[0]);
  const outputLines = [lines[0]];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];

    if (!line.trim()) {
      outputLines.push(line);
      continue;
    }

    const cells = splitCsvLine(line);
    const updated = [];

    for (let j = 0; j < cells.length; j += 1) {
      const header = headers[j] || "column_" + j;
      const originalCell = stripOuterQuotes(cells[j]);
      const redacted = redactStructuredValue(header, originalCell, findingsMap);

      if (typeof redacted === "string" && redacted !== originalCell) {
        updated.push(quoteIfNeeded(redacted));
      } else {
        updated.push(cells[j]);
      }
    }

    outputLines.push(updated.join(","));
  }

  const structuredCsv = outputLines.join("\n");
  const textResult = deidentifyText(structuredCsv);
  const combined = findingsMapToArray(findingsMap).concat(textResult.findings);

  return {
    text: textResult.text,
    findings: combineFindings(combined),
  };
}

export function buildReport(fileName, findings) {
  const lines = [
    "HungryHIPAA Deidentification Report",
    "File: " + fileName,
    "Processed: " + new Date().toLocaleString(),
    "",
  ];

  if (!findings.length) {
    lines.push("No supported PHI-like patterns were detected.");
    return lines.join("\n");
  }

  lines.push("Findings:");

  for (let i = 0; i < findings.length; i += 1) {
    const item = findings[i];
    lines.push("- " + item.type + ": " + item.count);

    if (item.examples && item.examples.length) {
      lines.push("  Examples: " + item.examples.join(" | "));
    }
  }

  return lines.join("\n");
}
