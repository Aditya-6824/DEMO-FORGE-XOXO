import os
import glob

directory = r"e:\Pro\demoforge\src\pages"
for filepath in glob.glob(os.path.join(directory, "*.tsx")):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "\\`" in content or "\\${" in content:
        print(f"Fixing {filepath}")
        content = content.replace("\\`", "`").replace("\\${", "${")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
print("Fixes applied.")
