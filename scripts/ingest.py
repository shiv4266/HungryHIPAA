import pandas as pd

patients = pd.read_csv("data/raw_patients.csv")
encounters = pd.read_csv("data/raw_encounters.csv")
conditions = pd.read_csv("data/raw_conditions.csv")

print("\n**** DATASETS LOADED SUCCESSFULLY  ****")

# Patients
print(f"\nPatients Preview:\n{patients.head()}")
print(f"\nPatients Columns:\n{patients.columns.tolist()}")
print(f"\nPatients Shape: {patients.shape}")

# Encounters
print(f"\nEncounters Preview:\n{encounters.head()}")
print(f"\nEncounters Columns:\n{encounters.columns.tolist()}")
print(f"\nEncounters Shape: {encounters.shape}")

# Conditions
print(f"\nConditions Preview:\n{conditions.head()}")
print(f"\nConditions Columns:\n{conditions.columns.tolist()}")
print(f"\nConditions Shape: {conditions.shape}")

# Missing Values
print(f"\nPatients Missing Values:\n{patients.isnull().sum()}")
print(f"\nEncounters Missing Values:\n{encounters.isnull().sum()}")
print(f"\nConditions Missing Values:\n{conditions.isnull().sum()}")


