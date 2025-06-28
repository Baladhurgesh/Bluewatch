import pandas as pd
import numpy as np
from datetime import datetime
import json

def extract_real_water_systems():
    """
    Extract real water systems data from CSV files
    """
    print("Loading CSV files...")
    
    try:
        # Load water systems data
        pws_df = pd.read_csv('data/SDWA_PUB_WATER_SYSTEMS.csv', dtype={'PWSID': str})
        pws_df.columns = pws_df.columns.str.strip()
        
        # Load geographic data
        geo_df = pd.read_csv('data/SDWA_GEOGRAPHIC_AREAS.csv', dtype={'PWSID': str})
        geo_df.columns = geo_df.columns.str.strip()
        
        # Load violations data
        violations_df = pd.read_csv('data/SDWA_VIOLATIONS_ENFORCEMENT.csv', dtype={'PWSID': str}, low_memory=False)
        violations_df.columns = violations_df.columns.str.strip()
        
        # Load reference codes
        ref_codes_df = pd.read_csv('data/SDWA_REF_CODE_VALUES.csv')
        ref_codes_df.columns = ref_codes_df.columns.str.strip()
        
        # Create contaminant lookup with better mapping
        contaminant_codes = ref_codes_df[ref_codes_df['VALUE_TYPE'] == 'CONTAMINANT_CODE'].set_index('VALUE_CODE')['VALUE_DESCRIPTION'].to_dict()
        
        # Add common contaminant mappings for better readability
        common_contaminants = {
            '1040': 'Nitrate',
            '1030': 'Lead',
            '1035': 'Copper',
            '5000': 'Lead and Copper Rule',
            '1925': 'pH',
            '1930': 'Total Dissolved Solids (TDS)',
            '2050': 'Atrazine',
            '2047': 'Aldicarb',
            '1095': 'Zinc',
            '1074': 'Antimony',
            '1038': 'Nitrate-Nitrite',
            '1094': 'Asbestos',
            '1080': 'Chromium, Hexavalent',
            '3100': 'Total Coliform',
            '5200': 'Radionuclides',
            '7000': 'Disinfection Byproducts',
            '5000': 'Treatment Technique',
            'Unknown': 'Unknown Contaminant'
        }
        
        # Update contaminant codes with common names
        contaminant_codes.update(common_contaminants)
        
        print("Processing water systems...")
        
        # Get active water systems (limit to first 50 for performance)
        active_systems = pws_df[pws_df['PWS_ACTIVITY_CODE'] == 'A'].head(50)
        
        water_systems = []
        
        for idx, system in active_systems.iterrows():
            pwsid = system['PWSID']
            
            # Get ZIP codes
            system_zips = geo_df[
                (geo_df['PWSID'] == pwsid) & 
                (geo_df['AREA_TYPE_CODE'] == 'ZC')
            ]['ZIP_CODE_SERVED'].dropna().astype(str).str[:5].unique().tolist()
            
            # If no ZIP codes in geographic areas, use the system's main ZIP
            if not system_zips or len(system_zips) == 0:
                if 'ZIP_CODE' in system and pd.notna(system['ZIP_CODE']):
                    zip_candidate = str(system['ZIP_CODE'])
                    if len(zip_candidate) >= 5:
                        system_zips = [zip_candidate[:5]]
            # Remove empty or invalid zip codes
            system_zips = [z for z in system_zips if z and z.isdigit() and len(z) == 5]
            
            # Get county
            county_rows = geo_df[
                (geo_df['PWSID'] == pwsid) & 
                (geo_df['AREA_TYPE_CODE'] == 'CN')
            ]
            county = county_rows.iloc[0]['COUNTY_SERVED'] if len(county_rows) > 0 else 'Unknown'
            
            # Get violations for this system
            system_violations = violations_df[violations_df['PWSID'] == pwsid].copy()
            
            # Count active violations
            active_violations = system_violations[
                (system_violations['VIOLATION_STATUS'].isin(['Unaddressed', 'Addressed'])) |
                (system_violations['VIOLATION_STATUS'].isna())
            ]
            
            # Get recent violations
            recent_violations = []
            if len(system_violations) > 0:
                # Clean dates
                system_violations['NON_COMPL_PER_BEGIN_DATE'] = pd.to_datetime(
                    system_violations['NON_COMPL_PER_BEGIN_DATE'], 
                    errors='coerce'
                )
                
                # Get recent violations with valid dates
                recent_viols = system_violations[
                    system_violations['NON_COMPL_PER_BEGIN_DATE'].notna()
                ].nlargest(3, 'NON_COMPL_PER_BEGIN_DATE')
                
                for _, viol in recent_viols.iterrows():
                    try:
                        # Get contaminant name
                        raw_code = viol['CONTAMINANT_CODE']
                        if pd.isna(raw_code):
                            contaminant_code = 'Unknown'
                        else:
                            # Convert to int if possible, then to string
                            try:
                                contaminant_code = str(int(float(raw_code)))
                            except Exception:
                                contaminant_code = str(raw_code)
                        contaminant_name = contaminant_codes.get(contaminant_code, contaminant_code)
                        
                        violation_info = {
                            'id': int(viol.name) if pd.notna(viol.name) else 0,
                            'type': viol['VIOLATION_CATEGORY_CODE'] if pd.notna(viol['VIOLATION_CATEGORY_CODE']) else 'Unknown',
                            'contaminant': contaminant_name,
                            'date': viol['NON_COMPL_PER_BEGIN_DATE'].strftime('%Y-%m-%d'),
                            'status': 'Resolved' if viol['VIOLATION_STATUS'] == 'Resolved' else 'Active',
                            'healthBased': viol['IS_HEALTH_BASED_IND'] == 'Y'
                        }
                        
                        # Add level and limit if available
                        if pd.notna(viol['VIOL_MEASURE']):
                            unit = viol['UNIT_OF_MEASURE'] if pd.notna(viol['UNIT_OF_MEASURE']) else ''
                            violation_info['level'] = f"{viol['VIOL_MEASURE']} {unit}".strip()
                        if pd.notna(viol['FEDERAL_MCL']):
                            violation_info['limit'] = str(viol['FEDERAL_MCL'])
                        
                        recent_violations.append(violation_info)
                    except Exception as e:
                        print(f"Error processing violation for {pwsid}: {e}")
                        continue
            
            # Calculate trust score
            trust_score = 100
            health_based_active = active_violations[active_violations['IS_HEALTH_BASED_IND'] == 'Y']
            trust_score -= len(health_based_active) * 15
            trust_score -= (len(active_violations) - len(health_based_active)) * 5
            trust_score = max(0, min(100, trust_score))
            
            # Determine water source
            water_source = 'Unknown'
            if pd.notna(system['PRIMARY_SOURCE_CODE']):
                if system['PRIMARY_SOURCE_CODE'].startswith('GW'):
                    water_source = 'Groundwater'
                elif system['PRIMARY_SOURCE_CODE'].startswith('SW'):
                    water_source = 'Surface Water'
                elif system['PRIMARY_SOURCE_CODE'] == 'GU':
                    water_source = 'Groundwater Under Influence'
            
            # Get last violation date
            last_violation = None
            if len(system_violations) > 0:
                try:
                    last_viol_date = system_violations['NON_COMPL_PER_BEGIN_DATE'].max()
                    if pd.notna(last_viol_date):
                        last_violation = last_viol_date.strftime('%Y-%m-%d')
                except:
                    pass
            
            # Create water system object
            water_system = {
                'pwsid': pwsid,
                'name': system['PWS_NAME'] if pd.notna(system['PWS_NAME']) else 'Unknown',
                'county': county,
                'zipCodes': system_zips,
                'population': int(system['POPULATION_SERVED_COUNT']) if pd.notna(system['POPULATION_SERVED_COUNT']) else 0,
                'trustScore': trust_score,
                'activeViolations': len(active_violations),
                'lastViolation': last_violation,
                'waterSource': water_source,
                'recentViolations': recent_violations
            }
            
            water_systems.append(water_system)
            
            if (idx + 1) % 10 == 0:
                print(f"Processed {idx + 1} water systems...")
        
        return water_systems
        
    except Exception as e:
        print(f"Error extracting water systems: {e}")
        return None

if __name__ == "__main__":
    print("Extracting real water systems data from CSV files...")
    
    water_systems = extract_real_water_systems()
    
    if water_systems:
        # Save to JSON
        with open('water-safety-dashboard/public/water_systems_data.json', 'w') as f:
            json.dump(water_systems, f, indent=2)
        
        print(f"Successfully extracted {len(water_systems)} real water systems!")
        print("Saved to: water-safety-dashboard/public/water_systems_data.json")
        
        # Show statistics
        print(f"\n=== Water Systems Statistics ===")
        print(f"Total systems: {len(water_systems)}")
        print(f"Systems with violations: {len([s for s in water_systems if s['activeViolations'] > 0])}")
        print(f"Average trust score: {sum([s['trustScore'] for s in water_systems]) / len(water_systems):.1f}")
        print(f"Population range: {min([s['population'] for s in water_systems])} - {max([s['population'] for s in water_systems])}")
        
        # Show sample system
        print(f"\n=== Sample Water System ===")
        sample = water_systems[0]
        print(f"Name: {sample['name']}")
        print(f"County: {sample['county']}")
        print(f"Population: {sample['population']:,}")
        print(f"Trust Score: {sample['trustScore']}")
        print(f"Active Violations: {sample['activeViolations']}")
        print(f"Water Source: {sample['waterSource']}")
        print(f"ZIP Codes: {sample['zipCodes']}")
        
        # Show sample violations
        if sample['recentViolations']:
            print(f"\nSample Violations:")
            for viol in sample['recentViolations'][:2]:
                print(f"  - {viol['contaminant']} ({viol['type']}) - {viol['status']}")
        
    else:
        print("Failed to extract water systems data. Check your CSV files.") 