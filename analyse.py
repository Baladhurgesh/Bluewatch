import pandas as pd
import numpy as np
from collections import Counter
import os

# List all CSV files mentioned in the README
files = [
    'data/SDWA_EVENTS_MILESTONES.csv',
    'data/SDWA_FACILITIES.csv', 
    'data/SDWA_GEOGRAPHIC_AREAS.csv',
    'data/SDWA_LCR_SAMPLES.csv',
    'data/SDWA_PN_VIOLATION_ASSOC.csv',
    'data/SDWA_PUB_WATER_SYSTEMS.csv',
    'data/SDWA_REF_CODE_VALUES.csv',
    'data/SDWA_SERVICE_AREAS.csv',
    'data/SDWA_SITE_VISITS.csv',
    'data/SDWA_VIOLATIONS_ENFORCEMENT.csv'
]

# Start by loading the main public water systems file
print("Loading Public Water Systems data...")
try:
    # Read the CSV file
    pws_df = pd.read_csv('data/SDWA_PUB_WATER_SYSTEMS.csv', 
                         dtype={'PWSID': str, 'ZIP_CODE': str},  # Keep these as strings
                         low_memory=False)
    
    # Clean column names by stripping whitespace
    pws_df.columns = pws_df.columns.str.strip()
    
    print("Public Water Systems Overview:")
    print(f"Total systems: {len(pws_df):,}")
    print(f"Number of fields: {len(pws_df.columns)}")
    print(f"\nFields: {list(pws_df.columns)}")
    print(f"\nSample data:")
    print(pws_df.head(1).to_dict('records')[0])
    
    # Group by system type
    print("\n=== System Types ===")
    system_types = pws_df['PWS_TYPE_CODE'].value_counts()
    for sys_type, count in system_types.items():
        type_desc = {
            'CWS': 'Community Water System',
            'NTNCWS': 'Non-Transient Non-Community',
            'TNCWS': 'Transient Non-Community'
        }.get(sys_type, sys_type)
        print(f"{sys_type} ({type_desc}): {count:,}")
    
    # Group by activity status
    print("\n=== Activity Status ===")
    activity_status = pws_df['PWS_ACTIVITY_CODE'].value_counts()
    for status, count in activity_status.items():
        status_desc = {
            'A': 'Active',
            'I': 'Inactive',
            'N': 'Now non-public',
            'M': 'Merged',
            'P': 'Future regulated'
        }.get(status, status)
        print(f"{status} ({status_desc}): {count:,}")
    
    # Population served analysis
    print("\n=== Population Served Analysis ===")
    pop_served = pws_df[pws_df['POPULATION_SERVED_COUNT'] > 0]['POPULATION_SERVED_COUNT'].sum()
    print(f"Total Population Served: {pop_served:,}")
    
    # Additional analysis
    print(f"\nAverage population per system: {pws_df['POPULATION_SERVED_COUNT'].mean():,.0f}")
    print(f"Median population per system: {pws_df['POPULATION_SERVED_COUNT'].median():,.0f}")
    
    # Population size categories
    print("\n=== Population Size Categories (POP_CAT_5_CODE) ===")
    pop_categories = pws_df['POP_CAT_5_CODE'].value_counts().sort_index()
    pop_cat_desc = {
        '1': '≤500',
        '2': '501-3,300',
        '3': '3,301-10,000',
        '4': '10,001-100,000',
        '5': '>100,000'
    }
    for cat, count in pop_categories.items():
        if pd.notna(cat):
            print(f"Category {cat} ({pop_cat_desc.get(str(int(cat)), 'Unknown')}): {count:,} systems")
    
    # Ownership types
    print("\n=== Ownership Types ===")
    ownership = pws_df['OWNER_TYPE_CODE'].value_counts()
    owner_desc = {
        'F': 'Federal',
        'L': 'Local government',
        'M': 'Public/Private',
        'N': 'Native American',
        'P': 'Private',
        'S': 'State government'
    }
    for owner_type, count in ownership.items():
        if pd.notna(owner_type):
            print(f"{owner_type} ({owner_desc.get(owner_type, 'Unknown')}): {count:,}")
    
    # Primary source analysis
    print("\n=== Primary Water Source ===")
    sources = pws_df['PRIMARY_SOURCE_CODE'].value_counts()
    source_desc = {
        'GW': 'Ground water',
        'GWP': 'Ground water purchased',
        'SW': 'Surface water',
        'SWP': 'Surface water purchased',
        'GU': 'Ground water under influence',
        'GUP': 'Purchased ground water under influence'
    }
    for source, count in sources.items():
        if pd.notna(source):
            print(f"{source} ({source_desc.get(source, 'Unknown')}): {count:,}")
    
except FileNotFoundError:
    print("Error: SDWA_PUB_WATER_SYSTEMS.csv not found in current directory")
    print("Please ensure the file is in the same directory as this script")
except Exception as e:
    print(f"Error loading data: {e}")

# Function to load and analyze violations data
def analyze_violations():
    print("\n\n=== VIOLATIONS AND ENFORCEMENT ANALYSIS ===")
    try:
        violations_df = pd.read_csv('data/SDWA_VIOLATIONS_ENFORCEMENT.csv',
                                   dtype={'PWSID': str},
                                   low_memory=False)
        violations_df.columns = violations_df.columns.str.strip()
        
        print(f"\nTotal violation records: {len(violations_df):,}")
        
        # Violation categories
        print("\n=== Violation Categories ===")
        viol_categories = violations_df['VIOLATION_CATEGORY_CODE'].value_counts()
        for cat, count in viol_categories.items():
            print(f"{cat}: {count:,}")
        
        # Health-based violations
        health_based = violations_df[violations_df['IS_HEALTH_BASED_IND'] == 'Y']
        print(f"\nHealth-based violations: {len(health_based):,} ({len(health_based)/len(violations_df)*100:.1f}%)")
        
        # Violation status
        print("\n=== Violation Status ===")
        viol_status = violations_df['VIOLATION_STATUS'].value_counts()
        for status, count in viol_status.items():
            if pd.notna(status):
                print(f"{status}: {count:,}")
        
        # Enforcement actions
        enforcement_actions = violations_df[violations_df['ENFORCEMENT_ID'].notna()]
        print(f"\nViolations with enforcement actions: {len(enforcement_actions):,}")
        
        # Enforcement categories
        print("\n=== Enforcement Action Categories ===")
        enf_categories = violations_df['ENF_ACTION_CATEGORY'].value_counts()
        for cat, count in enf_categories.items():
            if pd.notna(cat):
                print(f"{cat}: {count:,}")
                
    except FileNotFoundError:
        print("Violations file not found")
    except Exception as e:
        print(f"Error analyzing violations: {e}")

# Function to analyze Lead and Copper Rule samples
def analyze_lead_copper():
    print("\n\n=== LEAD AND COPPER ANALYSIS ===")
    try:
        lcr_df = pd.read_csv('data/SDWA_LCR_SAMPLES.csv',
                            dtype={'PWSID': str},
                            low_memory=False)
        lcr_df.columns = lcr_df.columns.str.strip()
        
        print(f"\nTotal LCR sample records: {len(lcr_df):,}")
        
        # Contaminants tested
        contaminants = lcr_df['CONTAMINANT_CODE'].value_counts()
        print("\n=== Contaminants Tested ===")
        for cont, count in contaminants.items():
            if pd.notna(cont):
                print(f"{cont}: {count:,} samples")
                
    except FileNotFoundError:
        print("Lead and Copper samples file not found")
    except Exception as e:
        print(f"Error analyzing LCR data: {e}")

# Function to analyze site visits
def analyze_site_visits():
    print("\n\n=== SITE VISIT ANALYSIS ===")
    try:
        visits_df = pd.read_csv('data/SDWA_SITE_VISITS.csv',
                               dtype={'PWSID': str},
                               low_memory=False)
        visits_df.columns = visits_df.columns.str.strip()
        
        print(f"\nTotal site visits: {len(visits_df):,}")
        
        # Evaluation codes - count deficiencies
        eval_columns = [col for col in visits_df.columns if col.endswith('_EVAL_CODE')]
        
        print("\n=== Site Visit Findings Summary ===")
        deficiency_summary = {
            'N': 'No deficiencies',
            'R': 'Recommendations',
            'M': 'Minor deficiencies',
            'S': 'Significant deficiencies',
            'D': 'Sanitary defect'
        }
        
        for eval_col in eval_columns:
            area = eval_col.replace('_EVAL_CODE', '').replace('_', ' ').title()
            print(f"\n{area}:")
            findings = visits_df[eval_col].value_counts()
            for code, count in findings.items():
                if pd.notna(code) and code in deficiency_summary:
                    print(f"  {deficiency_summary[code]}: {count:,}")
                    
    except FileNotFoundError:
        print("Site visits file not found")
    except Exception as e:
        print(f"Error analyzing site visits: {e}")

# Run all analyses if files exist
if __name__ == "__main__":
    # Check which files exist
    print("\n=== Checking for available files ===")
    for file in files:
        if os.path.exists(file):
            print(f"✓ {file} found")
        else:
            print(f"✗ {file} not found")
    
    # Run additional analyses if files exist
    if os.path.exists('data/SDWA_VIOLATIONS_ENFORCEMENT.csv'):
        analyze_violations()
    
    if os.path.exists('data/SDWA_LCR_SAMPLES.csv'):
        analyze_lead_copper()
        
    if os.path.exists('SDWA_SITE_VISITS.csv'):
        analyze_site_visits()