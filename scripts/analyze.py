import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import json
import os

print("\n**** RUNNING ANALYTICS ****")

# connect to SQLite
conn = sqlite3.connect("hungryhipaa.db")

# query1: top conditions
query1 = """
SELECT DESCRIPTION, COUNT(*) as total
FROM conditions
GROUP BY DESCRIPTION
ORDER BY total DESC
LIMIT 10
"""
top_conditions = pd.read_sql(query1,conn)

print("\nTop 10 Most Common Conditions: ")
print(top_conditions)

# query2: encounters per patient
query2 = """
SELECT PATIENT, COUNT(*) as encounter_count
FROM encounters
GROUP BY PATIENT
ORDER BY encounter_count DESC
LIMIT 10
"""
top_patients = pd.read_sql(query2, conn)

print("\nPatients with Most Encounters: ")
print(top_patients)

# query3: average enoucnter cost
query3 = """
SELECT AVG(TOTAL_CLAIM_COST) as avg_cost
FROM encounters
"""
avg_cost = pd.read_sql(query3, conn)

print("\nAverage Encounter Cost: ")
print(avg_cost)

# query4: encounter class distribution
query4 = """
SELECT ENCOUNTERCLASS, COUNT(*) AS TOTAL
FROM encounters
GROUP BY ENCOUNTERCLASS
ORDER BY total DESC
"""
encounter_types = pd.read_sql(query4, conn)

print("\nEncounter Type Distribution: ")
print(encounter_types)

# close database connection
conn.close()

# chart1: top 10 condiitons
os.makedirs("docs", exist_ok=True) #check for folders
os.makedirs("public", exist_ok=True)

plt.figure(figsize=(10,6))
plt.bar(top_conditions["DESCRIPTION"], top_conditions["total"])
plt.xticks(rotation=45, ha="right")
plt.title("Top 10 Most Common Conditions")
plt.xlabel("Condition")
plt.ylabel("Count")
plt.tight_layout()

# save to both locations
plt.savefig("docs/top_conditions_chart.png")
plt.savefig("public/top_conditions_chart.png")

plt.close()

# chart2: encounter type distribution
plt.figure(figsize=(8,6))
plt.bar(encounter_types["ENCOUNTERCLASS"], encounter_types["TOTAL"])
plt.title("Encounter Type Distribution")
plt.xlabel("Encounter Type")
plt.ylabel("Count")
plt.tight_layout()

# save
plt.savefig("docs/encounter_types_chart.png")
plt.savefig("public/encounter_types_chart.png")

plt.close()

print("\n**** ANALYTICS COMPLETE ****")

# summary JSON for frontend
summary = {
    "total_patients": 1163,
    "total_encounters": 61459,
    "total_conditions": 38094,
    "average_encounter_cost": float(avg_cost["avg_cost"][0])
}

os.makedirs("public", exist_ok=True)

with open("public/dashboard_summary.json", "w") as f:
    json.dump(summary, f, indent=2)