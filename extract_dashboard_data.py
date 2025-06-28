#!/usr/bin/env python3
"""
Comprehensive Dashboard Data Extraction Script
Extracts all necessary information from SDWIS CSV files for water safety dashboard
"""

import pandas as pd
import json
import os
from datetime import datetime
import logging
from typing import Dict, List, Any, Optional
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DashboardDataExtractor:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.reference_codes = {}
        self.water_systems = {}
        self.output_data = []
        
    def load_reference_codes(self):
        """Load reference code values for mapping codes to descriptions"""
        logger.info("Loading reference codes...")
        try:
            ref_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_REF_CODE_VALUES.csv"))
            
            # Create lookup dictionaries for different code types
            for _, row in ref_df.iterrows():
                value_type = row['VALUE_TYPE']
                value_code = row['VALUE_CODE']
                value_desc = row['VALUE_DESCRIPTION']
                
                if value_type not in self.reference_codes:
                    self.reference_codes[value_type] = {}
                
                self.reference_codes[value_type][value_code] = value_desc
                
            logger.info(f"Loaded {len(ref_df)} reference codes")
        except Exception as e:
            logger.error(f"Error loading reference codes: {e}")
    
    def get_code_description(self, value_type: str, code: str) -> str:
        """Get human-readable description for a code"""
        if value_type in self.reference_codes and code in self.reference_codes[value_type]:
            return self.reference_codes[value_type][code]
        return code
    
    def load_water_systems(self):
        """Load water systems data"""
        logger.info("Loading water systems...")
        try:
            systems_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_PUB_WATER_SYSTEMS.csv"))
            
            for _, row in systems_df.iterrows():
                pwsid = row['PWSID']
                
                self.water_systems[pwsid] = {
                    'pwsid': pwsid,
                    'name': row.get('PWS_NAME', ''),
                    'type': self.get_code_description('PWS_TYPE_CODE', row.get('PWS_TYPE_CODE', '')),
                    'type_code': row.get('PWS_TYPE_CODE', ''),
                    'primary_source': self.get_code_description('PRIMARY_SOURCE_CODE', row.get('PRIMARY_SOURCE_CODE', '')),
                    'primary_source_code': row.get('PRIMARY_SOURCE_CODE', ''),
                    'population_served': row.get('POPULATION_SERVED_COUNT', 0),
                    'service_connections': row.get('SERVICE_CONNECTIONS_COUNT', 0),
                    'activity_status': row.get('PWS_ACTIVITY_CODE', ''),
                    'owner_type': row.get('OWNER_TYPE_CODE', ''),
                    'address': {
                        'line1': row.get('ADDRESS_LINE1', ''),
                        'line2': row.get('ADDRESS_LINE2', ''),
                        'city': row.get('CITY_NAME', ''),
                        'zip': row.get('ZIP_CODE', ''),
                        'state': row.get('STATE_CODE', '')
                    },
                    'contact': {
                        'organization': row.get('ORG_NAME', ''),
                        'admin_name': row.get('ADMIN_NAME', ''),
                        'email': row.get('EMAIL_ADDR', ''),
                        'phone': row.get('PHONE_NUMBER', ''),
                        'fax': row.get('FAX_NUMBER', '')
                    },
                    'first_reported': row.get('FIRST_REPORTED_DATE', ''),
                    'last_reported': row.get('LAST_REPORTED_DATE', ''),
                    'is_grant_eligible': row.get('IS_GRANT_ELIGIBLE_IND', ''),
                    'is_wholesaler': row.get('IS_WHOLESALER_IND', ''),
                    'is_school_or_daycare': row.get('IS_SCHOOL_OR_DAYCARE_IND', '')
                }
                
            logger.info(f"Loaded {len(self.water_systems)} water systems")
        except Exception as e:
            logger.error(f"Error loading water systems: {e}")
    
    def load_geographic_areas(self):
        """Load geographic areas and add to water systems"""
        logger.info("Loading geographic areas...")
        try:
            geo_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_GEOGRAPHIC_AREAS.csv"))
            
            for _, row in geo_df.iterrows():
                pwsid = row['PWSID']
                if pwsid in self.water_systems:
                    if 'geographic_areas' not in self.water_systems[pwsid]:
                        self.water_systems[pwsid]['geographic_areas'] = []
                    
                    geo_area = {
                        'geo_id': row.get('GEO_ID', ''),
                        'area_type': row.get('AREA_TYPE_CODE', ''),
                        'state_served': row.get('STATE_SERVED', ''),
                        'zip_code': row.get('ZIP_CODE_SERVED', ''),
                        'city': row.get('CITY_SERVED', ''),
                        'county': row.get('COUNTY_SERVED', ''),
                        'last_reported': row.get('LAST_REPORTED_DATE', '')
                    }
                    
                    self.water_systems[pwsid]['geographic_areas'].append(geo_area)
                    
            logger.info("Geographic areas loaded")
        except Exception as e:
            logger.error(f"Error loading geographic areas: {e}")
    
    def load_service_areas(self):
        """Load service areas and add to water systems"""
        logger.info("Loading service areas...")
        try:
            service_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_SERVICE_AREAS.csv"))
            
            for _, row in service_df.iterrows():
                pwsid = row['PWSID']
                if pwsid in self.water_systems:
                    if 'service_areas' not in self.water_systems[pwsid]:
                        self.water_systems[pwsid]['service_areas'] = []
                    
                    service_area = {
                        'service_area_type': row.get('SERVICE_AREA_TYPE_CODE', ''),
                        'is_primary': row.get('IS_PRIMARY_SERVICE_AREA_CODE', ''),
                        'first_reported': row.get('FIRST_REPORTED_DATE', ''),
                        'last_reported': row.get('LAST_REPORTED_DATE', '')
                    }
                    
                    self.water_systems[pwsid]['service_areas'].append(service_area)
                    
            logger.info("Service areas loaded")
        except Exception as e:
            logger.error(f"Error loading service areas: {e}")
    
    def load_events_milestones(self):
        """Load events and milestones"""
        logger.info("Loading events and milestones...")
        try:
            events_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_EVENTS_MILESTONES.csv"))
            
            for _, row in events_df.iterrows():
                pwsid = row['PWSID']
                if pwsid in self.water_systems:
                    if 'events_milestones' not in self.water_systems[pwsid]:
                        self.water_systems[pwsid]['events_milestones'] = []
                    
                    event = {
                        'event_schedule_id': row.get('EVENT_SCHEDULE_ID', ''),
                        'event_end_date': row.get('EVENT_END_DATE', ''),
                        'event_actual_date': row.get('EVENT_ACTUAL_DATE', ''),
                        'event_comments': row.get('EVENT_COMMENTS_TEXT', ''),
                        'event_milestone_code': row.get('EVENT_MILESTONE_CODE', ''),
                        'event_reason_code': row.get('EVENT_REASON_CODE', ''),
                        'first_reported': row.get('FIRST_REPORTED_DATE', ''),
                        'last_reported': row.get('LAST_REPORTED_DATE', '')
                    }
                    
                    self.water_systems[pwsid]['events_milestones'].append(event)
                    
            logger.info("Events and milestones loaded")
        except Exception as e:
            logger.error(f"Error loading events and milestones: {e}")
    
    def load_violations_enforcement(self):
        """Load violations and enforcement actions"""
        logger.info("Loading violations and enforcement...")
        try:
            # Read in chunks due to large file size
            chunk_size = 10000
            violations_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_VIOLATIONS_ENFORCEMENT.csv"), chunksize=chunk_size)
            
            for chunk in violations_df:
                for _, row in chunk.iterrows():
                    pwsid = row['PWSID']
                    if pwsid in self.water_systems:
                        if 'violations_enforcement' not in self.water_systems[pwsid]:
                            self.water_systems[pwsid]['violations_enforcement'] = []
                        
                        # Parse dates more robustly
                        def parse_date(date_str):
                            if pd.isna(date_str) or str(date_str).strip() == '':
                                return None
                            try:
                                # Try different date formats
                                for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%Y%m%d']:
                                    try:
                                        return pd.to_datetime(date_str, format=fmt).strftime('%Y-%m-%d')
                                    except:
                                        continue
                                return None
                            except:
                                return None
                        
                        # Get violation type description
                        violation_code = str(row.get('VIOLATION_CODE', ''))
                        violation_type = self.get_code_description('VIOLATION_CODE', violation_code)
                        
                        # Get contaminant description
                        contaminant_code = str(row.get('CONTAMINANT_CODE', ''))
                        contaminant_name = self.get_code_description('CONTAMINANT_CODE', contaminant_code)
                        
                        # Determine status based on dates and compliance
                        compliance_status = row.get('COMPLIANCE_STATUS_CODE', '')
                        begin_date = parse_date(row.get('VIOLATION_BEGIN_DATE', ''))
                        end_date = parse_date(row.get('VIOLATION_END_DATE', ''))
                        resolved_date = parse_date(row.get('VIOLATION_RESOLVED_DATE', ''))
                        
                        # Create a more meaningful status
                        if resolved_date:
                            status = 'Resolved'
                        elif end_date:
                            status = 'Closed'
                        elif begin_date:
                            status = 'Active'
                        else:
                            status = 'Unknown'
                        
                        violation = {
                            'violation_id': str(row.get('VIOLATION_ID', '')),
                            'violation_code': violation_code,
                            'violation_category': row.get('VIOLATION_CATEGORY_CODE', ''),
                            'violation_type': violation_type or 'Unknown Violation',
                            'contaminant_code': contaminant_code,
                            'contaminant_name': contaminant_name or 'Unknown Contaminant',
                            'compliance_status': compliance_status,
                            'status': status,
                            'violation_begin_date': begin_date,
                            'violation_end_date': end_date,
                            'violation_resolved_date': resolved_date,
                            'enforcement_action': row.get('ENFORCEMENT_ACTION_CODE', ''),
                            'enforcement_action_date': parse_date(row.get('ENFORCEMENT_ACTION_DATE', '')),
                            'first_reported': parse_date(row.get('FIRST_REPORTED_DATE', '')),
                            'last_reported': parse_date(row.get('LAST_REPORTED_DATE', '')),
                            'priority': 'High' if violation_code in ['71', '72', '73'] else 'Medium',
                            'requires_action': status in ['Active', 'Unknown']
                        }
                        
                        self.water_systems[pwsid]['violations_enforcement'].append(violation)
                        
            logger.info("Violations and enforcement loaded")
        except Exception as e:
            logger.error(f"Error loading violations and enforcement: {e}")
    
    def load_lcr_samples(self):
        """Load lead and copper sample results"""
        logger.info("Loading LCR samples...")
        try:
            lcr_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_LCR_SAMPLES.csv"))
            
            for _, row in lcr_df.iterrows():
                pwsid = row['PWSID']
                if pwsid in self.water_systems:
                    if 'lcr_samples' not in self.water_systems[pwsid]:
                        self.water_systems[pwsid]['lcr_samples'] = []
                    
                    sample = {
                        'sample_id': row.get('SAMPLE_ID', ''),
                        'contaminant_code': row.get('CONTAMINANT_CODE', ''),
                        'sample_date': row.get('SAMPLE_DATE', ''),
                        'sample_result': row.get('SAMPLE_RESULT', ''),
                        'unit_of_measure': row.get('UNIT_OF_MEASURE', ''),
                        'sample_point_type': row.get('SAMPLE_POINT_TYPE_CODE', ''),
                        'first_reported': row.get('FIRST_REPORTED_DATE', ''),
                        'last_reported': row.get('LAST_REPORTED_DATE', '')
                    }
                    
                    self.water_systems[pwsid]['lcr_samples'].append(sample)
                    
            logger.info("LCR samples loaded")
        except Exception as e:
            logger.error(f"Error loading LCR samples: {e}")
    
    def load_site_visits(self):
        """Load site visits and inspections"""
        logger.info("Loading site visits...")
        try:
            # Read in chunks due to large file size
            chunk_size = 10000
            visits_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_SITE_VISITS.csv"), chunksize=chunk_size)
            
            for chunk in visits_df:
                for _, row in chunk.iterrows():
                    pwsid = row['PWSID']
                    if pwsid in self.water_systems:
                        if 'site_visits' not in self.water_systems[pwsid]:
                            self.water_systems[pwsid]['site_visits'] = []
                        
                        visit = {
                            'visit_id': row.get('VISIT_ID', ''),
                            'visit_date': row.get('VISIT_DATE', ''),
                            'agency_type': row.get('AGENCY_TYPE_CODE', ''),
                            'visit_reason': row.get('VISIT_REASON_CODE', ''),
                            'management_ops_eval': row.get('MANAGEMENT_OPS_EVAL_CODE', ''),
                            'source_water_eval': row.get('SOURCE_WATER_EVAL_CODE', ''),
                            'security_eval': row.get('SECURITY_EVAL_CODE', ''),
                            'pumps_eval': row.get('PUMPS_EVAL_CODE', ''),
                            'compliance_eval': row.get('COMPLIANCE_EVAL_CODE', ''),
                            'treatment_eval': row.get('TREATMENT_EVAL_CODE', ''),
                            'distribution_eval': row.get('DISTRIBUTION_EVAL_CODE', ''),
                            'financial_eval': row.get('FINANCIAL_EVAL_CODE', ''),
                            'visit_comments': row.get('VISIT_COMMENTS', ''),
                            'first_reported': row.get('FIRST_REPORTED_DATE', ''),
                            'last_reported': row.get('LAST_REPORTED_DATE', '')
                        }
                        
                        self.water_systems[pwsid]['site_visits'].append(visit)
                        
            logger.info("Site visits loaded")
        except Exception as e:
            logger.error(f"Error loading site visits: {e}")
    
    def load_facilities(self):
        """Load facilities data"""
        logger.info("Loading facilities...")
        try:
            # Read in chunks due to large file size
            chunk_size = 10000
            facilities_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_FACILITIES.csv"), chunksize=chunk_size)
            
            for chunk in facilities_df:
                for _, row in chunk.iterrows():
                    pwsid = row['PWSID']
                    if pwsid in self.water_systems:
                        if 'facilities' not in self.water_systems[pwsid]:
                            self.water_systems[pwsid]['facilities'] = []
                        
                        facility = {
                            'facility_id': row.get('FACILITY_ID', ''),
                            'facility_name': row.get('FACILITY_NAME', ''),
                            'facility_type': row.get('FACILITY_TYPE_CODE', ''),
                            'facility_status': row.get('FACILITY_STATUS_CODE', ''),
                            'facility_begin_date': row.get('FACILITY_BEGIN_DATE', ''),
                            'facility_end_date': row.get('FACILITY_END_DATE', ''),
                            'first_reported': row.get('FIRST_REPORTED_DATE', ''),
                            'last_reported': row.get('LAST_REPORTED_DATE', '')
                        }
                        
                        self.water_systems[pwsid]['facilities'].append(facility)
                        
            logger.info("Facilities loaded")
        except Exception as e:
            logger.error(f"Error loading facilities: {e}")
    
    def load_pn_violation_assoc(self):
        """Load public notification violation associations"""
        logger.info("Loading PN violation associations...")
        try:
            pn_df = pd.read_csv(os.path.join(self.data_dir, "SDWA_PN_VIOLATION_ASSOC.csv"))
            
            for _, row in pn_df.iterrows():
                pwsid = row['PWSID']
                if pwsid in self.water_systems:
                    if 'pn_violations' not in self.water_systems[pwsid]:
                        self.water_systems[pwsid]['pn_violations'] = []
                    
                    pn_violation = {
                        'violation_id': row.get('VIOLATION_ID', ''),
                        'pn_type': row.get('PN_TYPE_CODE', ''),
                        'pn_date': row.get('PN_DATE', ''),
                        'first_reported': row.get('FIRST_REPORTED_DATE', ''),
                        'last_reported': row.get('LAST_REPORTED_DATE', '')
                    }
                    
                    self.water_systems[pwsid]['pn_violations'].append(pn_violation)
                    
            logger.info("PN violation associations loaded")
        except Exception as e:
            logger.error(f"Error loading PN violation associations: {e}")
    
    def calculate_summary_stats(self):
        """Calculate summary statistics for each water system"""
        logger.info("Calculating summary statistics...")
        
        for pwsid, system in self.water_systems.items():
            # Initialize summary stats
            system['summary_stats'] = {
                'total_violations': 0,
                'active_violations': 0,
                'total_enforcement_actions': 0,
                'total_site_visits': 0,
                'total_lcr_samples': 0,
                'total_events': 0,
                'total_facilities': 0,
                'zip_codes': set(),
                'counties': set(),
                'cities': set()
            }
            
            # Count violations
            if 'violations_enforcement' in system:
                system['summary_stats']['total_violations'] = len(system['violations_enforcement'])
                active_violations = [v for v in system['violations_enforcement'] 
                                   if v.get('compliance_status') in ['O', 'R']]  # Open or Resolved
                system['summary_stats']['active_violations'] = len(active_violations)
                
                enforcement_actions = [v for v in system['violations_enforcement'] 
                                     if v.get('enforcement_action')]
                system['summary_stats']['total_enforcement_actions'] = len(enforcement_actions)
            
            # Count other items
            if 'site_visits' in system:
                system['summary_stats']['total_site_visits'] = len(system['site_visits'])
            
            if 'lcr_samples' in system:
                system['summary_stats']['total_lcr_samples'] = len(system['lcr_samples'])
            
            if 'events_milestones' in system:
                system['summary_stats']['total_events'] = len(system['events_milestones'])
            
            if 'facilities' in system:
                system['summary_stats']['total_facilities'] = len(system['facilities'])
            
            # Collect geographic info
            if 'geographic_areas' in system:
                for geo in system['geographic_areas']:
                    if geo.get('zip_code'):
                        system['summary_stats']['zip_codes'].add(geo['zip_code'])
                    if geo.get('county'):
                        system['summary_stats']['counties'].add(geo['county'])
                    if geo.get('city'):
                        system['summary_stats']['cities'].add(geo['city'])
            
            # Convert sets to lists for JSON serialization
            system['summary_stats']['zip_codes'] = list(system['summary_stats']['zip_codes'])
            system['summary_stats']['counties'] = list(system['summary_stats']['counties'])
            system['summary_stats']['cities'] = list(system['summary_stats']['cities'])
        
        logger.info("Summary statistics calculated")
    
    def clean_data_for_json(self):
        """Clean data for JSON serialization"""
        logger.info("Cleaning data for JSON serialization...")
        
        def clean_value(value):
            """Recursively clean a value for JSON serialization"""
            # Handle None
            if value is None:
                return None
            # Handle NaN for scalars
            if isinstance(value, (float, int)) and pd.isna(value):
                return None
            # Handle empty string
            if isinstance(value, str) and value.strip() == '':
                return None
            # Handle lists/tuples
            if isinstance(value, (list, tuple)):
                return [clean_value(v) for v in value]
            # Handle dicts
            if isinstance(value, dict):
                return {k: clean_value(v) for k, v in value.items()}
            # For other types, just return
            return value
        
        for pwsid, system in self.water_systems.items():
            cleaned_system = clean_value(system)
            self.water_systems[pwsid] = cleaned_system
        
        logger.info("Data cleaned for JSON serialization")
    
    def save_output(self, output_file: str = "dashboard_data.json"):
        """Save the complete dataset to JSON"""
        logger.info(f"Saving complete dataset to {output_file}...")
        
        try:
            # Convert to list for easier processing
            output_list = list(self.water_systems.values())
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(output_list, f, indent=2, ensure_ascii=False, default=str)
            
            logger.info(f"Dataset saved successfully to {output_file}")
            logger.info(f"Total water systems: {len(output_list)}")
            
            # Print some summary statistics
            total_violations = sum(s.get('summary_stats', {}).get('total_violations', 0) for s in output_list)
            total_systems = len(output_list)
            active_systems = sum(1 for s in output_list if s.get('activity_status') == 'A')
            
            logger.info(f"Summary:")
            logger.info(f"  - Total water systems: {total_systems}")
            logger.info(f"  - Active systems: {active_systems}")
            logger.info(f"  - Total violations: {total_violations}")
            
        except Exception as e:
            logger.error(f"Error saving output: {e}")
    
    def extract_all_data(self):
        """Main method to extract all data"""
        logger.info("Starting comprehensive data extraction...")
        
        # Load all data in sequence
        self.load_reference_codes()
        self.load_water_systems()
        self.load_geographic_areas()
        self.load_service_areas()
        self.load_events_milestones()
        self.load_violations_enforcement()
        self.load_lcr_samples()
        self.load_site_visits()
        self.load_facilities()
        self.load_pn_violation_assoc()
        
        # Calculate summary statistics
        self.calculate_summary_stats()
        
        # Clean data for JSON
        self.clean_data_for_json()
        
        # Save output
        self.save_output()
        
        logger.info("Data extraction completed successfully!")

def main():
    """Main function"""
    extractor = DashboardDataExtractor()
    extractor.extract_all_data()

if __name__ == "__main__":
    main() 