import pandas as pd
import sqlite3

print("\n**** LOADING DATA INTO SQLITE DATABASE ****")

# load processed provider data
patients = pd.read_csv("data/provider_patients.csv")
encounters = pd.read_csv("data/provider_encounters.csv")
conditions = pd.read_csv("data/provider_conditions.csv")

# connect to SQLite database
conn = sqlite3.connect("hungryhipaa.db")

# load data into tables
patients.to_sql("patients", conn, if_exists="replace", index=False)
encounters.to_sql("encounters", conn, if_exists="replace", index=False)
conditions.to_sql("conditions", conn, if_exists="replace", index=False)

print("\nTables created successfully:")
print("- patients")
print("- encounters")
print("- conditions")

# verify row countes
patients_count = pd.read_sql("SELECT COUNT(*) AS count FROM patients", conn)
encounters_count = pd.read_sql("SELECT COUNT(*) AS count FROM encounters", conn)
conditions_count = pd.read_sql("SELECT COUNT(*) AS count FROM conditions", conn)

print(f"\nPatients rows loaded: {patients_count['count'][0]}")
print(f"Encounters rows loaded: {encounters_count['count'][0]}")
print(f"Conditions rows loaded: {conditions_count['count'][0]}")

conn.close()
print("\n**** DATABASE LOAD COMPLETE ****")