#!/usr/bin/env python3
"""Drive the CareAccess app in Chrome via CDP while ffmpeg records Xvfb."""
import json, time, sys, urllib.request
import websocket

DEBUG = "http://localhost:9222"

def get_ws():
    for _ in range(30):
        try:
            tabs = json.load(urllib.request.urlopen(DEBUG + "/json"))
            for t in tabs:
                if t.get("type") == "page":
                    return t["webSocketDebuggerUrl"]
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError("no debug target")

ws = websocket.create_connection(get_ws(), timeout=30)
mid = 0

def cmd(method, **params):
    global mid
    mid += 1
    ws.send(json.dumps({"id": mid, "method": method, "params": params}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get("id") == mid:
            return msg.get("result", {})

def js(expr):
    r = cmd("Runtime.evaluate", expression=expr, awaitPromise=True, returnByValue=True)
    return r.get("result", {}).get("value")

def shot_note(note):
    print(f"[{time.strftime('%H:%M:%S')}] {note}", flush=True)

cmd("Page.enable")
cmd("Runtime.enable")

# 1. Land on the app
cmd("Page.navigate", url="http://localhost:3777/")
time.sleep(4)
shot_note("landing")

# 2. Fill the form visibly: area (type char by char), need, submit
js("document.getElementById('area-input').focus()")
for ch in "Jayanagar":
    js(f"document.getElementById('area-input').value += '{ch}'; document.getElementById('area-input').dispatchEvent(new Event('input', {{bubbles:true}}))")
    time.sleep(0.12)
time.sleep(1)
js("var s=document.getElementById('need-select'); s.value='vaccination'; s.dispatchEvent(new Event('change',{bubbles:true}))")
time.sleep(1.2)
shot_note("form filled")
js("document.getElementById('submit-btn').click()")
shot_note("submitted, waiting for live agent")
# wait for results (agent roundtrip ~4-9s)
for _ in range(40):
    done = js("document.getElementById('results-section') && !document.getElementById('results-section').hidden && document.getElementById('facility-output').innerHTML.length > 200")
    if done:
        break
    time.sleep(0.5)
time.sleep(1)
js("document.getElementById('results-section').scrollIntoView({behavior:'smooth'})")
time.sleep(5)
shot_note("results shown")

# 3. Switch to Kannada
js("document.querySelector('[data-lang=\"KN\"]').click()")
time.sleep(3)
shot_note("kannada UI")
js("window.scrollTo({top:0,behavior:'smooth'})")
time.sleep(2)

# 4. Second query in Hindi UI: maternal, Rajajinagar
js("document.querySelector('[data-lang=\"HI\"]').click()")
time.sleep(2)
js("var a=document.getElementById('area-input'); a.value=''; a.dispatchEvent(new Event('input',{bubbles:true}))")
for ch in "Rajajinagar":
    js(f"document.getElementById('area-input').value += '{ch}'; document.getElementById('area-input').dispatchEvent(new Event('input', {{bubbles:true}}))")
    time.sleep(0.1)
js("var s=document.getElementById('need-select'); s.value='maternal'; s.dispatchEvent(new Event('change',{bubbles:true}))")
time.sleep(1)
js("document.getElementById('submit-btn').click()")
shot_note("hindi query submitted")
for _ in range(40):
    done = js("document.getElementById('results-section') && !document.getElementById('results-section').hidden && document.getElementById('facility-output').innerHTML.length > 200")
    if done:
        break
    time.sleep(0.5)
time.sleep(1)
js("document.getElementById('results-section').scrollIntoView({behavior:'smooth'})")
time.sleep(6)
shot_note("hindi results")

# 5. Back to English, scroll to top, hold
js("document.querySelector('[data-lang=\"EN\"]').click()")
js("window.scrollTo({top:0,behavior:'smooth'})")
time.sleep(4)
shot_note("done")
ws.close()
