import os
import re

files_to_update = [
    r"frontend\src\pages\Settings.jsx",
    r"frontend\src\pages\Tracker.jsx",
    r"frontend\src\pages\AIGenerator.jsx",
    r"frontend\src\pages\Chat.jsx",
    r"frontend\src\pages\UserSearch.jsx",
]

base_dir = r"c:\Users\VINAY\Documents\vinay\Foodity anti"

replacements = [
    (r'(?<=[\s"\'])bg-gray-50(?=[\s"\'])', r'bg-gray-50 dark:bg-gray-950'),
    (r'(?<=[\s"\'])bg-white(?=[\s"\'])', r'bg-white dark:bg-gray-900'),
    
    (r'(?<=[\s"\'])border-gray-100(?=[\s"\'])', r'border-gray-100 dark:border-gray-800'),
    (r'(?<=[\s"\'])border-gray-200(?=[\s"\'])', r'border-gray-200 dark:border-gray-700'),
    
    (r'(?<=[\s"\'])text-gray-900(?=[\s"\'])', r'text-gray-900 dark:text-white'),
    (r'(?<=[\s"\'])text-gray-800(?=[\s"\'])', r'text-gray-800 dark:text-gray-200'),
    (r'(?<=[\s"\'])text-gray-700(?=[\s"\'])', r'text-gray-700 dark:text-gray-300'),
    (r'(?<=[\s"\'])text-gray-600(?=[\s"\'])', r'text-gray-600 dark:text-gray-400'),
    (r'(?<=[\s"\'])text-gray-500(?=[\s"\'])', r'text-gray-500 dark:text-gray-400'),
    (r'(?<=[\s"\'])text-gray-400(?=[\s"\'])', r'text-gray-400 dark:text-gray-500'),
    
    (r'(?<=[\s"\'])hover:bg-gray-50(?=[\s"\'])', r'hover:bg-gray-50 dark:hover:bg-gray-800'),
    (r'(?<=[\s"\'])hover:bg-gray-100(?=[\s"\'])', r'hover:bg-gray-100 dark:hover:bg-gray-700'),
    (r'(?<=[\s"\'])hover:text-gray-900(?=[\s"\'])', r'hover:text-gray-900 dark:hover:text-white'),
    
    (r'(?<=[\s"\'])placeholder-gray-400(?=[\s"\'])', r'placeholder-gray-400 dark:placeholder-gray-500'),
    (r'(?<=[\s"\'])placeholder-gray-300(?=[\s"\'])', r'placeholder-gray-300 dark:placeholder-gray-600')
]

for short_path in files_to_update:
    file_path = os.path.join(base_dir, short_path)
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # For safe sequential application, we ONLY apply the replacements once to exactly matching original tokens.
    # To prevent cascading, we can do it in a single pass using a combined regex, but since we use lookbehinds
    # for ONLY standard classes (no dark: prefix), it naturally avoids mutating newly inserted dark: classes.
    
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content)

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {short_path}")
    else:
        print(f"No changes for {short_path}")
