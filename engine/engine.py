

import json
import sys


for line in sys.stdin:
    cleaned_line = line.strip()  
    
    # Skip if the line is empty
    if not cleaned_line:  
        continue

    try:
        req = json.loads(line)
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}", file=sys.stderr)
        print(json.dumps({"ok": False, "error": "bad json", "code": "BAD_JSON"}), flush=True)
        continue

    resp = {"id": req.get("id"), "ok": False, "error": "unknown command", "code": "UNKNOWN_CMD"}
    print(json.dumps(resp), flush=True)
