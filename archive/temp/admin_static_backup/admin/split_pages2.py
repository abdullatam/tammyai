import re
import os

os.makedirs('pages', exist_ok=True)

def extract_and_write(filename, parts):
    with open(filename, 'r') as f:
        content = f.read()

    # Get the D variable header
    header_match = re.search(r'^const D2? = window\.AdminData;', content, re.M)
    header = header_match.group(0) if header_match else "const D = window.AdminData;"

    for part_name, regex_start, regex_end in parts:
        start_match = re.search(regex_start, content)
        end_match = re.search(regex_end, content) if regex_end else None
        
        start_idx = start_match.start()
        end_idx = end_match.start() if end_match else len(content)
        
        part_content = content[start_idx:end_idx]
        
        # Remove Object.assign at end if any
        part_content = re.sub(r'Object\.assign\(window, \{[^}]+\}\);', '', part_content)

        out_content = header + '\n\n' + part_content.strip() + '\n\n'
        out_content += f'window.{part_name} = {part_name};\n'
        
        # Fix D vs D2
        if 'D2.' in out_content and 'const D2' not in out_content:
            out_content = out_content.replace('const D =', 'const D2 = window.AdminData;\nconst D =')
            
        with open(f'pages/{part_name}.jsx', 'w') as outf:
            outf.write(out_content)
        print(f'Wrote pages/{part_name}.jsx')

parts_1 = [
    ('OverviewPage', r'// ═══ PAGE 1', r'// ═══ PAGE 2'),
    ('PromptPage', r'// ═══ PAGE 2', r'// ═══ PAGE 3'),
    ('RAGPage', r'// ═══ PAGE 3', r'// ═══ PAGE 4'),
    ('UsersPage', r'// ═══ PAGE 4', None)
]

parts_2 = [
    ('ConvosPage', r'// ═══ PAGE 5', r'// ═══ PAGE 6'),
    ('TestPage', r'// ═══ PAGE 6', r'// ═══ PAGE 7'),
    ('EQPage', r'// ═══ PAGE 7', r'// ═══ PAGE 8'),
    ('SettingsPage', r'// ═══ PAGE 8', r'const ProfilePage ='),
    ('ProfilePage', r'const ProfilePage =', None)
]

extract_and_write('pages-1.jsx', parts_1)
extract_and_write('pages-2.jsx', parts_2)

