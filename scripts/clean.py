import pandas as pd

# load raw datasets
patients = pd.read_csv("data/raw_patients.csv")
encounters = pd.read_csv("data/raw_encounters.csv")
conditions = pd.read_csv("data/raw_conditions.csv")

print("\n**** CLEANING DATASETS ****")

# clean patients
patients["BIRTHDATE"] = pd.to_datetime(patients["BIRTHDATE"], errors="coerce")
patients["DEATHDATE"] = pd.to_datetime(patients["DEATHDATE"], errors="coerce")
patients = patients.drop_duplicates()
print(f"\nPatients shape after cleaning: {patients.shape}")

# clean encounters
encounters["START"] = pd.to_datetime(encounters["START"])
encounters["STOP"] = pd.to_datetime(encounters["STOP"])
encounters = encounters.drop_duplicates()

encounters["ENCOUNTER_DURATION_DAYS"] = (
    encounters["STOP"] - encounters["START"]
).dt.days

print(f"\nEncounters shape after cleaning: {encounters.shape}")

# clean conditions
conditions["START"] = pd.to_datetime(conditions["START"], errors="coerce")
conditions["STOP"] = pd.to_datetime(conditions["STOP"], errors="coerce")
conditions = conditions.drop_duplicates()

conditions["CONDITION_DURATION_DAYS"] = (
    conditions["STOP"] - conditions["START"]
).dt.days

print(f"\nConditions shape after cleaning: {conditions.shape}")

# save clean datasets
patients.to_csv("data/clean_patients.csv", index=False)
encounters.to_csv("data/clean_encounters.csv", index=False)
conditions.to_csv("data/clean_conditions.csv", index=False)
print("\n**** CLEANED FILES SAVED ****")