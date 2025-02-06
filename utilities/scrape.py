import requests
from bs4 import BeautifulSoup
import pandas as pd

# Base URL
base_url = "https://catalog.drexel.edu/coursedescriptions/quarter/undergrad/"

# Function to get all course links from the main page
def get_department_links():
    response = requests.get(base_url)
    if response.status_code != 200:
        print("Failed to retrieve main page")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    links = soup.select("a[href]")  # Select all links

    # Filter only department/course-related links
    department_links = [
        base_url + link['href'] for link in links if link['href'].startswith("https://catalog.drexel.edu/coursedescriptions/quarter/undergrad/")]
    
    return department_links

# Function to extract course details from a department page
def get_courses_from_department(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve {url}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    courses = []

    # Course titles are in <strong> inside <p class="courseblocktitle">
    for course_block in soup.select("p.courseblocktitle"):
        course_title = course_block.get_text(strip=True)
        courses.append(course_title)

    return courses

# Main execution
department_links = get_department_links()
all_courses = []

for link in department_links:
    print(link)
    courses = get_courses_from_department(link)
    all_courses.extend(courses)

# Save to CSV
df = pd.DataFrame(all_courses, columns=["Course Title"])
df.to_csv("drexel_courses.csv", index=False)

print("Course list saved to drexel_courses.csv")