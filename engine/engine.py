

import json
import sys
from markitdown import MarkItDown
md = MarkItDown()


SUPPORTED = ["pdf", "docx", "pptx", "xlsx", "csv", "html", "epub", "json", "xml"]


## We use this to check for the kind of files we can convert
def handle(req):
    cmd = req.get("cmd")

    if cmd == "capabilities":
        return {"id": req.get("id"), "ok": True, "extensions": SUPPORTED}
    
    if cmd == "convert":
        return convert(req)
    
    return {"id": req.get("id"), "ok": False, "error": "unknown command", "code": "UNKNOWN_CMD"}


## Where the main file conversion happens

def convert(req):
    path = req.get("path")

    try:
        res = md.convert_local(path)
        return {"id": req.get("id"), "ok": True, "markdown": res.text_content}
    except Exception as e:
        return {"id": req.get("id"), "ok": False, "error": str(e), "code": "CONVERT_FAILED"}




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

    resp = handle(req)
    print(json.dumps(resp), flush=True)
