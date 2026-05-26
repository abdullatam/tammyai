import re
import os

def split_file(filepath, outdir):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the D variable declaration
    header_match = re.search(r'const (D2?|D) = window.AdminData;', content)
    header = header_match.group(0) if header_match else "const D = window.AdminData;"

    # Find all components using regex
    # Match "// ═══ PAGE X..." up to the next "// ═══ PAGE" or end of file
    pages = re.split(r'(?m)^// ═══ PAGE \d+ — [^\n]+\n', content)
    
    # The first item is the header stuff before the first page
    pages = pages[1:]
    
    # Re-find the headers so we can get the page names
    headers = re.findall(r'(?m)^// ═══ PAGE \d+ — [^\n]+\n', content)

    for i, page_content in enumerate(pages):
        header_text = headers[i]
        
        # Find the main component name (e.g. const OverviewPage = )
        comp_match = re.search(r'const ([A-Za-z]+Page) = \(\) => \{', page_content)
        if not comp_match:
            continue
        
        comp_name = comp_match.group(1)
        
        # Remove Object.assign at the end of the file if present
        page_content = re.sub(r'Object\.assign\(window, \{[^}]+\}\);', '', page_content)
        
        out_content = header_text + header + '\n\n' + page_content.strip() + '\n\n'
        out_content += f'window.{comp_name} = {comp_name};\n'
        
        # Replace D2 with D if needed for consistency or keep it
        # Wait, if D2 is used, we should add const D2 = window.AdminData
        if 'D2.' in out_content and 'const D2 =' not in out_content:
            out_content = out_content.replace('const D =', 'const D2 = window.AdminData;\nconst D =')

        out_path = os.path.join(outdir, f'{comp_name}.jsx')
        with open(out_path, 'w') as outf:
            outf.write(out_content)
        print(f'Wrote {out_path}')

os.makedirs('pages_output', exist_ok=True)
split_file('pages-1.jsx', 'pages_output')
split_file('pages-2.jsx', 'pages_output')
