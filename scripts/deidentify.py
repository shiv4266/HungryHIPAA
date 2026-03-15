import pandas as pd
from datetime import datetime

print("\n**** DEIDENTIFYING DATA ****")

patients = pd.read_csv("data/clean_patients.csv")
encounters = pd.read_csv("data/clean_encounters.csv")
conditions = pd.read_csv("data/clean_conditions.csv")

# convert birthdate
patients["BIRTHDATE"] = pd.to_datetime(patients["BIRTHDATE"], errors="coerce")

current_year = datetime.now().year
patients["AGE"] = current_year - patients["BIRTHDATE"].dt.year

# age groups for patient-safe side
patients["AGE_GROUP"] = pd.cut(
    patients["AGE"],
    bins = [0, 17, 34, 49, 64, 120],
    labels = ["0-17", "18-34", "35-49", "50-64", "65+"],
    right= True
)

phi_columns = [
    "SSN", "DRIVERS", "PASSPORT", "FIRST", "LAST", "ADDRESS",
    "ZIP", "LAT", "LON"
]

# provider version
provider_patients = patients.drop(columns=phi_columns, errors="ignore")

# patient version
patientsafe_patients = provider_patients.drop(
    columns = ["BIRTHDATE", "CITY", "COUNTY"],
    errors="ignore"
)

# save provider files
provider_patients.to_csv("data/provider_patients.csv", index=False)
encounters.to_csv("data/provider_encounter.csv", index=False)
conditions.to_csv("data/provider_conditions.csv", index=False)

# save patient-safe files
patientsafe_patients.to_csv("data/patientsafe_patients.csv", index=False)
encounters.to_csv("data/patientsafe_encounters.csv", index=False)
conditions.to_csv("data/patientsafe_conditions.csv", index=False)

print("\n**** SUCCESS! PROVIDER AND PATIENT-SAFE FILES SAVED ****")
