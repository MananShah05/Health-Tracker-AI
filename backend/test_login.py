"""Quick test for the login API endpoint."""
import urllib.request
import json

url = "http://localhost:8000/api/auth/login"
data = json.dumps({"email": "demo@test.com", "password": "password123"}).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = json.loads(resp.read().decode())
        print("SUCCESS:", json.dumps(body, indent=2))
        
        # Now test /api/auth/me
        token = body["access_token"]
        me_req = urllib.request.Request(
            "http://localhost:8000/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(me_req, timeout=30) as me_resp:
            me_body = json.loads(me_resp.read().decode())
            print("\nUSER PROFILE:", json.dumps(me_body, indent=2))
except Exception as e:
    print(f"ERROR: {e}")
    if hasattr(e, 'read'):
        print("Response body:", e.read().decode())
