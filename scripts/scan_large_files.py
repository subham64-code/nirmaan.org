import os
sizes=[]
for root,dirs,files in os.walk('d:/nirmaan.org'):
    for f in files:
        p=os.path.join(root,f)
        try:
            s=os.path.getsize(p)
        except Exception:
            continue
        if s>500*1024:
            sizes.append((s,p))
sizes.sort(reverse=True)
for s,p in sizes[:100]:
    print(f"{s/1024/1024:.2f} MB - {p}")
