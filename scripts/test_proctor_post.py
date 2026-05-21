import base64, requests, os
p = os.path.join('frontend','public','gallery-students.jpg')
with open(p,'rb') as f:
    img_b64 = base64.b64encode(f.read()).decode('ascii')
base = 'http://127.0.0.1:5001'
s = requests.Session()
# visit proctoring-launch to seed demo session
r = s.get(base + '/proctoring-launch')
print('launch', r.status_code, 'cookies', s.cookies.get_dict())
for path in ['/proctoring/check-face','/proctoring/check-eyes','/proctoring/check-gaze','/proctoring/check-people']:
    url = base + path
    r = s.post(url, json={'image': img_b64}, timeout=20)
    print('\nPOST', path, '->', r.status_code)
    try:
        print('JSON:', r.json())
    except Exception:
        print('TEXT:', r.text[:500])
