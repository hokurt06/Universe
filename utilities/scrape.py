import requests
from bs4 import BeautifulSoup
import pandas as pd
import csv  # Import CSV module for quoting

# Base URL
base_url = "https://catalog.drexel.edu/coursedescriptions/quarter/undergrad"

# Function to get all course links from the main page
def get_department_links():
    response = requests.get(base_url)
    if response.status_code != 200:
        print("Failed to retrieve main page")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    links = soup.select("a[href]")

    # Filter only department/course-related links
    department_links = [
        "https://catalog.drexel.edu" + link['href'] for link in links if link['href'].startswith("/coursedescriptions/quarter/undergrad/")
    ]
    
    return department_links

# Function to extract course details from a department page
def get_courses_from_department(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve {url}, got error {response.status_code}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    courses = []

    course_blocks = soup.select("div.courseblock")

    for course_block in course_blocks:
        title_block = course_block.select_one("p.courseblocktitle strong")
        if not title_block:
            continue

        spans = title_block.find_all("span", class_="cdspacing")
        if len(spans) < 2:
            continue  # Ensure we have enough spans

        course_code = spans[0].get_text(strip=True).replace(" ", "-")  # Format like ADGD-I199
        course_title = spans[1].get_text(strip=True)

        # Extract credits by removing the spans and extracting the remaining numeric text
        raw_text = title_block.get_text(" ", strip=True)
        credit_text = raw_text.replace(course_code, "").replace(course_title, "").replace("Credits", "").strip()

        # Extract description
        desc_block = course_block.select_one("p.courseblockdesc")
        description = desc_block.get_text(strip=True) if desc_block else ""

        # Extract college/department correctly
        college_text = ""
        for b_tag in course_block.find_all("b"):
            if "College/Department:" in b_tag.get_text(strip=True):
                college_text = b_tag.next_sibling.strip() if b_tag.next_sibling else ""
                break  # Stop after finding the first matching <b> tag

        courses.append([course_code, course_title, credit_text, description, college_text])

    return courses

# Main execution
department_links = get_department_links()
all_courses = []

for link in department_links:
    print(f"Scraping: {link}")
    courses = get_courses_from_department(link)
    all_courses.extend(courses)

# Debug: Print total extracted courses
print(f"Total courses extracted: {len(all_courses)}")

# Save to CSV with quotes to handle commas properly
if all_courses:
    df = pd.DataFrame(all_courses, columns=["Course Code", "Title", "Credits", "Description", "College"])
    df.to_csv("drexel_courses.csv", index=False, quoting=csv.QUOTE_ALL)  # Quotes all fields
    print("Course list saved to drexel_courses.csv")
else:
    print("No course data extracted. Check parsing logic.")