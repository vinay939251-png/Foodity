import os
import re

base_dir = r"c:\Users\VINAY\Documents\vinay\Foodity anti\frontend\src"

bad_pairs = [
    (r'dark:text-gray-400 dark:text-gray-500', r'dark:text-gray-400'),
    (r'dark:text-gray-300 dark:text-gray-400', r'dark:text-gray-300'),
    (r'dark:text-gray-200 dark:text-gray-300', r'dark:text-gray-200'),
    (r'dark:text-white dark:text-gray-200', r'dark:text-white'),
    (r'dark:bg-gray-800 dark:bg-gray-700', r'dark:bg-gray-800'),
    (r'dark:bg-gray-900 dark:bg-gray-800', r'dark:bg-gray-900'),
    (r'dark:bg-gray-950 dark:bg-gray-900', r'dark:bg-gray-950'),
    (r'dark:border-gray-800 dark:border-gray-700', r'dark:border-gray-800'),
    (r'dark:hover:bg-gray-800 dark:hover:bg-gray-700', r'dark:hover:bg-gray-800'),
    (r'dark:hover:bg-gray-800 dark:bg-gray-800', r'dark:hover:bg-gray-800'), # In case
]

for root, _, files in os.walk(base_dir):
    for f in files:
        if f.endswith('.jsx'):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            new_content = content
            for bad, good in bad_pairs:
                new_content = new_content.replace(bad, good)
            
            # Clean up duplicate spaces inside className=""
            # This is a bit tricky with pure replace, but let's try to remove extra spaces
            new_content = re.sub(r' +', ' ', new_content)

            if content != new_content:
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Cleaned {file_path}")
