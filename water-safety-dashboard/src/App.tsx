import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, XCircle, Info, Bell, Droplets, MapPin, Users, BookOpen, Filter } from 'lucide-react';

interface Violation {
  id: number;
  type: string;
  contaminant: string;
  date: string;
  status: string;
  healthBased: boolean;
  level?: string;
  limit?: string;
  resolvedDate?: string;
}

interface WaterSystem {
  pwsid: string;
  name: string;
  county: string;
  zipCodes: string[];
  population: number;
  trustScore: number;
  activeViolations: number;
  lastViolation: string;
  waterSource: string;
  recentViolations: Violation[];
  phone?: string;
}

interface ContaminantInfo {
  code: string;
  name: string;
  description: string;
  healthEffects: string;
  whatToDo: string;
  sources: string[];
  mcl: string;
  category: string;
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'zip' | 'county' | 'name'>('zip');
  const [searchResults, setSearchResults] = useState<WaterSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<WaterSystem | null>(null);
  const [showAlertSignup, setShowAlertSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contaminantInfo, setContaminantInfo] = useState<Record<string, ContaminantInfo>>({});
  const [waterSystems, setWaterSystems] = useState<WaterSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContaminantGuide, setShowContaminantGuide] = useState(false);
  const [contaminantSearchTerm, setContaminantSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');

  // Load data from JSON files
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load contaminant information
        const contaminantResponse = await fetch('/contaminant_info.json');
        const contaminantData = await contaminantResponse.json();
        setContaminantInfo(contaminantData);
        console.log('Loaded contaminant info:', contaminantData);
        
        // Load water systems data
        const waterSystemsResponse = await fetch('/water_systems_data.json');
        const waterSystemsData = await waterSystemsResponse.json();
        setWaterSystems(waterSystemsData);
        console.log('Loaded water systems:', waterSystemsData);
        console.log('Number of water systems loaded:', Array.isArray(waterSystemsData) ? waterSystemsData.length : 'Not an array');
        
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to basic data if JSON loading fails
        setContaminantInfo({
          'Nitrate': {
            code: '1040',
            name: 'Nitrate',
            description: 'Chemical that can come from fertilizer runoff, septic systems, or natural deposits',
            healthEffects: 'Especially dangerous for infants under 6 months - can cause "blue baby syndrome" (methemoglobinemia)',
            whatToDo: 'DO NOT BOIL - boiling increases nitrate concentration. Use bottled water for infant formula and drinking.',
            sources: ['Agricultural runoff', 'Septic systems', 'Natural deposits'],
            mcl: '10 mg/L',
            category: 'Inorganic Chemicals'
          },
          'Lead and Copper Rule': {
            code: '5000',
            name: 'Lead and Copper Rule',
            description: 'Regulatory framework for monitoring lead and copper in drinking water',
            healthEffects: 'Lead can cause developmental delays in children and health problems in adults',
            whatToDo: 'Run cold water for 30 seconds before use. Consider water testing and filters certified for lead removal.',
            sources: ['Corrosion of household plumbing', 'Lead service lines'],
            mcl: 'Action Level: 0.015 mg/L Lead, 1.3 mg/L Copper',
            category: 'Regulatory'
          },
          'Turbidity': {
            code: '1925',
            name: 'Turbidity',
            description: 'Cloudiness in water caused by particles',
            healthEffects: 'Not directly harmful but can interfere with disinfection and indicate other problems',
            whatToDo: 'Usually resolved quickly. If persistent, contact your water system.',
            sources: ['Soil runoff', 'Treatment process issues'],
            mcl: '5 NTU (secondary standard)',
            category: 'Physical Parameters'
          }
        });
        
        // Fallback sample water systems
        setWaterSystems([
          {
            pwsid: 'GA0010000',
            name: 'BAXLEY',
            county: 'APPLING',
            zipCodes: ['31513', '31515'],
            population: 5749,
            trustScore: 92,
            activeViolations: 0,
            lastViolation: '2023-08-15',
            waterSource: 'Groundwater',
            recentViolations: []
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = () => {
    if (!searchTerm) return;
    
    const results = waterSystems.filter(system => {
      if (searchType === 'zip') {
        // Debug log for each system
        console.log('Checking system:', system.name, 'zipCodes:', system.zipCodes, 'searchTerm:', searchTerm);
        return system.zipCodes.some(zip => zip.trim() === searchTerm.trim());
      } else if (searchType === 'county') {
        return system.county.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return system.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
    
    setSearchResults(results);
    setSelectedSystem(null);
  };

  // Debug logging for state
  useEffect(() => {
    console.log('Current state:', {
      searchTerm,
      searchResultsLength: searchResults.length,
      selectedSystem: selectedSystem ? 'selected' : 'none',
      waterSystemsLength: waterSystems.length
    });
  }, [searchTerm, searchResults, selectedSystem, waterSystems]);

  const getTrustScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrustScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Concerns';
    return 'Serious Issues';
  };

  const getViolationSeverity = (violation: Violation): 'high' | 'medium' | 'low' => {
    if (violation.healthBased && violation.status === 'Active') return 'high';
    if (violation.healthBased) return 'medium';
    return 'low';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get contaminant info with fuzzy matching
  const getContaminantInfo = (contaminantName: string): ContaminantInfo | null => {
    // Direct match
    if (contaminantInfo[contaminantName]) {
      return contaminantInfo[contaminantName];
    }
    
    // Fuzzy matching
    const normalizedSearch = contaminantName.toLowerCase().trim();
    for (const [key, info] of Object.entries(contaminantInfo)) {
      if (key.toLowerCase().includes(normalizedSearch) || 
          normalizedSearch.includes(key.toLowerCase()) ||
          info.name.toLowerCase().includes(normalizedSearch)) {
        return info;
      }
    }
    
    return null;
  };

  // Remove duplicate violations
  const deduplicateViolations = (violations: Violation[]): Violation[] => {
    const seen = new Set<string>();
    const uniqueViolations: Violation[] = [];
    
    violations.forEach(violation => {
      // Create a unique key based on contaminant, type, and date
      const key = `${violation.contaminant}-${violation.type}-${violation.date}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueViolations.push(violation);
      }
    });
    
    return uniqueViolations;
  };

  // Get unique categories from contaminant info
  const getContaminantCategories = (): string[] => {
    const categories = new Set<string>();
    Object.values(contaminantInfo).forEach(info => {
      if (info.category) {
        categories.add(info.category);
      }
    });
    return Array.from(categories).sort();
  };

  // Filter contaminants for the guide
  const getFilteredContaminants = () => {
    let filtered = Object.entries(contaminantInfo);
    
    if (contaminantSearchTerm) {
      const search = contaminantSearchTerm.toLowerCase();
      filtered = filtered.filter(([key, info]) => 
        key.toLowerCase().includes(search) || 
        info.name.toLowerCase().includes(search) ||
        info.description.toLowerCase().includes(search)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(([_, info]) => info.category === selectedCategory);
    }
    
    return filtered;
  };

  // Send email function
  const sendEmail = async (emailAddress: string, phoneNumber: string) => {
    setIsSendingEmail(true);
    setEmailStatus('idle');
    setEmailMessage('');

    try {
      // Validate email
      if (!emailAddress || !emailAddress.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Call the backend API
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailAddress,
          phone: phoneNumber,
          waterSystem: selectedSystem?.name,
          county: selectedSystem?.county
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }

      if (data.success) {
        setEmailStatus('success');
        setEmailMessage(data.message);
        
        // Clear form after success
        setTimeout(() => {
          setEmail('');
          setPhone('');
          setShowAlertSignup(false);
          setEmailStatus('idle');
          setEmailMessage('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to send email');
      }

    } catch (error) {
      setEmailStatus('error');
      setEmailMessage(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading water safety data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Droplets className="w-8 h-8" />
                Georgia Water Safety Dashboard
              </h1>
              <p className="mt-2 text-blue-200">Check your drinking water quality and get alerts</p>
            </div>
            <button
              onClick={() => setShowContaminantGuide(true)}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Contaminant Guide
            </button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-xl font-semibold mb-4">Find Your Water System</h2>
          
          <div className="flex gap-2 mb-4">
            <select 
              className="px-4 py-2 border rounded-lg"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'zip' | 'county' | 'name')}
            >
              <option value="zip">ZIP Code</option>
              <option value="county">County</option>
              <option value="name">System Name</option>
            </select>
            
            <input
              type="text"
              placeholder={`Enter ${searchType === 'zip' ? 'ZIP code' : searchType === 'county' ? 'county name' : 'system name'}...`}
              className="flex-1 px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
          
          {/* Quick search suggestions */}
          <div className="text-sm text-gray-600">
            <p>Try searching for: <span className="font-medium">Appling</span> (county), <span className="font-medium">BAXLEY</span> (system name), or browse all {waterSystems.length} systems</p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {searchResults.length > 0 && !selectedSystem && (
        <div className="max-w-6xl mx-auto p-6">
          <h3 className="text-lg font-semibold mb-4">
            Found {searchResults.length} water system{searchResults.length > 1 ? 's' : ''}
          </h3>
          
          <div className="space-y-4">
            {searchResults.map(system => (
              <div
                key={system.pwsid}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => setSelectedSystem(system)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold">{system.name}</h4>
                    <div className="flex gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {system.county} County
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {system.population.toLocaleString()} served
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="w-4 h-4" />
                        {system.waterSource}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center ml-6">
                    <div className={`text-3xl font-bold ${getTrustScoreColor(system.trustScore)}`}>
                      {system.trustScore}
                    </div>
                    <div className="text-sm text-gray-600">Trust Score</div>
                    <div className={`text-sm font-medium ${getTrustScoreColor(system.trustScore)}`}>
                      {getTrustScoreLabel(system.trustScore)}
                    </div>
                  </div>
                </div>
                
                {system.activeViolations > 0 && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {system.activeViolations} active violation{system.activeViolations > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show all systems if no search results */}
      {!searchResults.length && !selectedSystem && searchTerm === '' && (
        <div className="max-w-6xl mx-auto p-6">
          <h3 className="text-lg font-semibold mb-4">
            All Water Systems ({waterSystems.length} total)
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {waterSystems.slice(0, 12).map(system => (
              <div
                key={system.pwsid}
                className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => setSelectedSystem(system)}
              >
                <h4 className="font-semibold text-lg">{system.name}</h4>
                <p className="text-sm text-gray-600">{system.county} County</p>
                <p className="text-sm text-gray-600">{system.population.toLocaleString()} people</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{system.waterSource}</span>
                  <div className={`text-lg font-bold ${getTrustScoreColor(system.trustScore)}`}>
                    {system.trustScore}
                  </div>
                </div>
                {system.activeViolations > 0 && (
                  <div className="mt-2 text-xs text-red-600">
                    {system.activeViolations} active violation{system.activeViolations > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {waterSystems.length > 12 && (
            <div className="mt-6 text-center text-gray-600">
              <p>Showing first 12 systems. Use search to find specific systems.</p>
            </div>
          )}
        </div>
      )}

      {/* System Details */}
      {selectedSystem && (
        <div className="max-w-6xl mx-auto p-6">
          <button
            onClick={() => setSelectedSystem(null)}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            ← Back to search results
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border">
            {/* System Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSystem.name}</h2>
                  <div className="flex gap-4 text-gray-600 mt-2">
                    <span>System ID: {selectedSystem.pwsid}</span>
                    <span>{selectedSystem.county} County</span>
                    <span>{selectedSystem.population.toLocaleString()} people served</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAlertSignup(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  Get Alerts
                </button>
              </div>
            </div>
            
            {/* Is My Water Safe? Section */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                Is My Water Safe?
              </h3>
              
              {/* Trust Score */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">Overall Water Quality Score</h4>
                    <p className="text-gray-600 mt-1">
                      Based on violations, compliance history, and system characteristics
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getTrustScoreColor(selectedSystem.trustScore)}`}>
                      {selectedSystem.trustScore}
                    </div>
                    <div className={`text-lg font-medium ${getTrustScoreColor(selectedSystem.trustScore)}`}>
                      {getTrustScoreLabel(selectedSystem.trustScore)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Current Status */}
              {selectedSystem.activeViolations === 0 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">No Active Violations</h4>
                    <p className="text-green-800 mt-1">
                      Your water system currently meets all federal drinking water standards.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900">
                        {selectedSystem.activeViolations} Active Violation{selectedSystem.activeViolations > 1 ? 's' : ''}
                      </h4>
                      <p className="text-red-800 mt-1">
                        Your water system has violations that may affect water quality. See details below.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Violations List */}
              {selectedSystem.recentViolations.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Recent Violations & Issues</h4>
                  <div className="space-y-4">
                    {deduplicateViolations(selectedSystem.recentViolations).map(violation => {
                      const severity = getViolationSeverity(violation);
                      const info = getContaminantInfo(violation.contaminant);
                      
                      return (
                        <div 
                          key={violation.id}
                          className={`border rounded-lg p-4 ${
                            severity === 'high' ? 'border-red-300 bg-red-50' :
                            severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                            'border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold text-lg flex items-center gap-2">
                                {info?.name || violation.contaminant}
                                {violation.healthBased && (
                                  <span className="text-sm px-2 py-0.5 bg-red-200 text-red-800 rounded">
                                    Health-Based
                                  </span>
                                )}
                                {info?.category && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded">
                                    {info.category}
                                  </span>
                                )}
                              </h5>
                              <div className="text-sm text-gray-600 mt-1">
                                <span>Type: {violation.type}</span>
                                <span className="mx-2">•</span>
                                <span>Date: {formatDate(violation.date)}</span>
                                {violation.level && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>Level: {violation.level} {violation.limit && `(Limit: ${violation.limit})`}</span>
                                  </>
                                )}
                                {info?.mcl && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>MCL: {info.mcl}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              violation.status === 'Active' 
                                ? 'bg-red-200 text-red-800' 
                                : 'bg-green-200 text-green-800'
                            }`}>
                              {violation.status}
                              {violation.resolvedDate && (
                                <div className="text-xs mt-0.5">
                                  {formatDate(violation.resolvedDate)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {info && (
                            <div className="space-y-3">
                              <div>
                                <h6 className="font-medium text-sm text-gray-700">What is this?</h6>
                                <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                              </div>
                              
                              {info.sources && info.sources.length > 0 && (
                                <div>
                                  <h6 className="font-medium text-sm text-gray-700">Common Sources</h6>
                                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                                    {info.sources.map((source, index) => (
                                      <li key={index}>{source}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {violation.status === 'Active' && info.healthEffects && (
                                <div>
                                  <h6 className="font-medium text-sm text-gray-700">Health Effects</h6>
                                  <p className="text-sm text-gray-600 mt-1">{info.healthEffects}</p>
                                </div>
                              )}
                              
                              {violation.status === 'Active' && info.whatToDo && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <h6 className="font-medium text-sm text-blue-900">What Should I Do?</h6>
                                  <p className="text-sm text-blue-800 mt-1">{info.whatToDo}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!info && (
                            <div className="text-sm text-gray-500 italic">
                              No detailed information available for this contaminant. Contact your water system for more details.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Additional Information */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Want to Know More?
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                  <li>• Request your annual Consumer Confidence Report from your water system</li>
                  <li>• Get your tap water tested by a certified laboratory</li>
                  <li>• Contact your water system at {selectedSystem.phone || '(contact info not available)'}</li>
                  <li>• Learn more about drinking water standards at EPA.gov</li>
                  <li>• Check our <button 
                    onClick={() => setShowContaminantGuide(true)} 
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Contaminant Guide
                  </button> for detailed information about water contaminants</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contaminant Guide Modal */}
      {showContaminantGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Contaminant Information Guide</h3>
                <button
                  onClick={() => setShowContaminantGuide(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="mt-4 flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search contaminants..."
                    className="w-full px-3 py-2 border rounded-lg"
                    value={contaminantSearchTerm}
                    onChange={(e) => setContaminantSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {getContaminantCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh] p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {getFilteredContaminants().map(([key, info]) => (
                  <div key={key} className="border rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{info.name}</h4>
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                        {info.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>MCL:</strong> {info.mcl}
                      </div>
                      
                      {info.healthEffects && (
                        <div>
                          <strong>Health Effects:</strong> {info.healthEffects}
                        </div>
                      )}
                      
                      {info.whatToDo && (
                        <div>
                          <strong>What to Do:</strong> {info.whatToDo}
                        </div>
                      )}
                      
                      {info.sources && info.sources.length > 0 && (
                        <div>
                          <strong>Sources:</strong>
                          <ul className="list-disc list-inside ml-2">
                            {info.sources.map((source, index) => (
                              <li key={index}>{source}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {getFilteredContaminants().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No contaminants found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Alert Signup Modal */}
      {showAlertSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Get Water Quality Alerts</h3>
            <p className="text-gray-600 mb-4">
              Receive notifications about violations, boil water advisories, and when issues are resolved.
            </p>
            
            {/* Success/Error Messages */}
            {emailStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{emailMessage}</p>
              </div>
            )}
            
            {emailStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{emailMessage}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSendingEmail}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSendingEmail}
                />
              </div>
              
              {selectedSystem && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Water System:</strong> {selectedSystem.name}<br/>
                    <strong>County:</strong> {selectedSystem.county}
                  </p>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                <p>You'll receive notifications about:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>New violations</li>
                  <li>Boil water advisories</li>
                  <li>Resolution updates</li>
                  <li>Water quality reports</li>
                </ul>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => sendEmail(email, phone)}
                  disabled={isSendingEmail || !email}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAlertSignup(false);
                    setEmail('');
                    setPhone('');
                    setEmailStatus('idle');
                    setEmailMessage('');
                  }}
                  disabled={isSendingEmail}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;