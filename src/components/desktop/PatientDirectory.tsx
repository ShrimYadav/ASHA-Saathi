import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  User,
  Heart,
  Baby,
  AlertTriangle,
  ClipboardList,
  Calendar,
  Building,
  Phone,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  Mic,
  Activity,
  FileText,
  GitPullRequest,
  AlertOctagon,
  Eye,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { ASSETS } from '../../data/mockData';

export interface PatientDirectoryProps {
  people: any[];
  households: any[];
  visits: any[];
  referrals: any[];
  onStartVisit: (person: any) => void;
  onIssueReferral?: (person: any) => void;
  onSelectHousehold?: (householdId: string) => void;
  className?: string;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({
  people = [],
  households = [],
  visits = [],
  referrals = [],
  onStartVisit,
  onIssueReferral,
  onSelectHousehold,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedHamlet, setSelectedHamlet] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [inspectModalPatient, setInspectModalPatient] = useState<any | null>(null);

  // Index households by ID
  const householdMap = useMemo(() => {
    const map = new Map<string, any>();
    households.forEach((h) => map.set(h.id, h));
    return map;
  }, [households]);

  // Index visits by personId and personName
  const visitsByPerson = useMemo(() => {
    const map = new Map<string, any[]>();
    visits.forEach((v) => {
      const keyId = v.personId;
      const keyName = (v.personName || '').toLowerCase().trim();
      if (keyId) {
        if (!map.has(keyId)) map.set(keyId, []);
        map.get(keyId)!.push(v);
      }
      if (keyName) {
        if (!map.has(keyName)) map.set(keyName, []);
        map.get(keyName)!.push(v);
      }
    });
    return map;
  }, [visits]);

  // Index referrals by personId and personName
  const referralsByPerson = useMemo(() => {
    const map = new Map<string, any[]>();
    referrals.forEach((r) => {
      const keyId = r.personId;
      const keyName = (r.personName || '').toLowerCase().trim();
      if (keyId) {
        if (!map.has(keyId)) map.set(keyId, []);
        map.get(keyId)!.push(r);
      }
      if (keyName) {
        if (!map.has(keyName)) map.set(keyName, []);
        map.get(keyName)!.push(r);
      }
    });
    return map;
  }, [referrals]);

  // Filtered patients list
  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return people.filter((p) => {
      const linkedHh = householdMap.get(p.householdId);
      const hhCode = linkedHh?.code?.toLowerCase() || '';
      const hhHead = linkedHh?.headName?.toLowerCase() || '';
      const hhTola = linkedHh?.tola?.toLowerCase() || '';
      const hhId = (p.householdId || '').toLowerCase();

      // Search match: Name, Household ID, Household Code, Tola, Condition, or Phone
      if (query) {
        const nameMatch = p.name?.toLowerCase().includes(query);
        const hhIdMatch = hhId.includes(query);
        const hhCodeMatch = hhCode.includes(query);
        const hhHeadMatch = hhHead.includes(query);
        const tolaMatch = hhTola.includes(query);
        const conditionMatch = p.condition?.toLowerCase().includes(query);
        const idMatch = p.id?.toLowerCase().includes(query);
        const phoneMatch = p.phone?.toLowerCase().includes(query);

        if (!nameMatch && !hhIdMatch && !hhCodeMatch && !hhHeadMatch && !tolaMatch && !conditionMatch && !idMatch && !phoneMatch) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Pregnant' && p.category !== 'Pregnant') return false;
        if (selectedCategory === 'Children' && p.category !== 'Children') return false;
        if (selectedCategory === 'High Risk' && p.category !== 'High Risk') return false;
        if (selectedCategory === 'General' && p.category !== 'General') return false;
      }

      // Hamlet filter
      if (selectedHamlet !== 'All') {
        if (linkedHh && !linkedHh.tola.toLowerCase().includes(selectedHamlet.toLowerCase())) {
          return false;
        }
      }

      // Priority filter
      if (selectedPriority !== 'All') {
        if (p.statusTag !== selectedPriority) return false;
      }

      return true;
    });
  }, [people, searchQuery, selectedCategory, selectedHamlet, selectedPriority, householdMap]);

  // Stats
  const totalCount = people.length;
  const highPriorityCount = people.filter((p) => p.statusTag === 'High Priority').length;
  const pregnantCount = people.filter((p) => p.category === 'Pregnant').length;
  const childrenCount = people.filter((p) => p.category === 'Children').length;

  const getPatientAvatar = (name: string, gender: string) => {
    if (name.includes('Kamal')) return ASSETS.kamalSingh;
    if (name.includes('Radhika')) return ASSETS.radhikaSharma;
    if (name.includes('Sunita')) return ASSETS.sunitaDevi;
    if (gender === 'Male') {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80';
    }
    return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80';
  };

  return (
    <div className={`p-6 sm:p-8 space-y-6 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Patient &amp; Beneficiary Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search past visit records, clinical vitals, and referral histories by beneficiary name or household ID.
          </p>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-xs">
            <span className="text-emerald-700 font-bold">{filteredPatients.length}</span> / {totalCount} Patients
          </span>
          {highPriorityCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold shadow-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{highPriorityCount} High Priority</span>
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedCategory === 'All'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
              : 'bg-white border-slate-200/90 text-slate-800 hover:border-emerald-300'
          }`}
        >
          <span className="text-[11px] font-medium opacity-80 block">All Beneficiaries</span>
          <span className="text-lg font-bold block mt-0.5">{totalCount}</span>
        </button>

        <button
          onClick={() => setSelectedCategory('Pregnant')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedCategory === 'Pregnant'
              ? 'bg-pink-700 text-white border-pink-800 shadow-sm'
              : 'bg-white border-slate-200/90 text-slate-800 hover:border-pink-300'
          }`}
        >
          <span className="text-[11px] font-medium opacity-80 block flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>Maternal (ANC)</span>
          </span>
          <span className="text-lg font-bold block mt-0.5">{pregnantCount}</span>
        </button>

        <button
          onClick={() => setSelectedCategory('Children')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedCategory === 'Children'
              ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
              : 'bg-white border-slate-200/90 text-slate-800 hover:border-blue-300'
          }`}
        >
          <span className="text-[11px] font-medium opacity-80 block flex items-center gap-1">
            <Baby className="w-3 h-3" />
            <span>Children (&lt;2y)</span>
          </span>
          <span className="text-lg font-bold block mt-0.5">{childrenCount}</span>
        </button>

        <button
          onClick={() => setSelectedPriority(selectedPriority === 'High Priority' ? 'All' : 'High Priority')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedPriority === 'High Priority'
              ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
              : 'bg-white border-slate-200/90 text-slate-800 hover:border-rose-300'
          }`}
        >
          <span className="text-[11px] font-medium opacity-80 block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>High Priority Flags</span>
          </span>
          <span className="text-lg font-bold block mt-0.5">{highPriorityCount}</span>
        </button>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Beneficiary Name or Household ID (e.g. 'Kamal', 'Savita', 'HH-01', 'HH-PIP-003', 'Radhika')..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-medium text-slate-800 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Household ID Jumps */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Locate Household:
          </span>
          {[
            { id: 'HH-01', label: 'HH-01: Ramesh Sharma' },
            { id: 'HH-02', label: 'HH-02: Santosh Bai' },
            { id: 'HH-03', label: 'HH-03: Kamal Singh (TB)' },
            { id: 'HH-04', label: 'HH-04: Manoj Verma' },
            { id: 'HH-05', label: 'HH-05: Meena Patel' },
          ].map((hh) => (
            <button
              key={hh.id}
              type="button"
              onClick={() => setSearchQuery(searchQuery === hh.id ? '' : hh.id)}
              className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold border transition-all cursor-pointer ${
                searchQuery === hh.id
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
              }`}
            >
              {hh.label}
            </button>
          ))}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills & Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Filter:</span>
            {[
              { id: 'All', label: 'All Categories' },
              { id: 'Pregnant', label: 'Pregnant (ANC)' },
              { id: 'Children', label: 'Children (<2y)' },
              { id: 'High Risk', label: 'High Risk' },
              { id: 'General', label: 'General' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedCategory(pill.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === pill.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Hamlet filter */}
            <select
              value={selectedHamlet}
              onChange={(e) => setSelectedHamlet(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="All">All Hamlets / Tolas</option>
              <option value="Pipra Tola">Pipra Tola</option>
              <option value="Pipra Purwa">Pipra Purwa</option>
              <option value="Bishanpur">Bishanpur</option>
              <option value="Kalyanpur">Kalyanpur</option>
            </select>

            {/* Priority filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="High Priority">High Priority</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Routine">Routine</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Patient Cards Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((person) => {
            const linkedHh = householdMap.get(person.householdId);
            const pVisits = visitsByPerson.get(person.id) || visitsByPerson.get(person.name.toLowerCase().trim()) || [];
            const pReferrals = referralsByPerson.get(person.id) || referralsByPerson.get(person.name.toLowerCase().trim()) || [];
            const isExpanded = expandedPatientId === person.id;
            const hasHighPriority = person.statusTag === 'High Priority';

            return (
              <div
                key={person.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden ${
                  hasHighPriority
                    ? 'border-rose-200 hover:border-rose-400'
                    : 'border-slate-200/80 hover:border-emerald-300'
                }`}
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getPatientAvatar(person.name, person.gender)}
                        alt={person.name}
                        className={`w-12 h-12 rounded-full object-cover ring-2 ${
                          hasHighPriority ? 'ring-rose-400' : 'ring-emerald-600/30'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700">
                            {person.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {person.age} yrs • {person.gender} • {person.relationshipToHead || 'Beneficiary'}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        person.statusTag === 'High Priority'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : person.statusTag === 'Follow Up'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {person.statusTag || 'Routine'}
                    </span>
                  </div>

                  {/* Linked Household ID & Location Pill */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">
                        {linkedHh?.code || person.householdId || 'HH-01'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="truncate max-w-[120px]">{linkedHh?.tola || 'Pipra Tola'}</span>
                    </div>

                    {onSelectHousehold && linkedHh && (
                      <button
                        onClick={() => onSelectHousehold(linkedHh.id)}
                        className="text-[11px] text-emerald-700 font-bold hover:underline"
                        title="View household"
                      >
                        View Family →
                      </button>
                    )}
                  </div>

                  {/* Condition & Observations */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Diagnosis / Condition:</span>
                      <span className="font-bold text-slate-900">{person.condition}</span>
                    </div>

                    {person.symptoms && person.symptoms.length > 0 && (
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Symptoms Recorded:</span>
                        <div className="flex flex-wrap gap-1">
                          {person.symptoms.slice(0, 3).map((s: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                          {person.symptoms.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{person.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Vitals summary if present */}
                    {person.vitals && Object.keys(person.vitals).length > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                        {person.vitals.bp && <span>BP: {person.vitals.bp}</span>}
                        {person.vitals.weightKg && <span>• Wt: {person.vitals.weightKg}kg</span>}
                        {person.vitals.hemoglobin && <span>• Hb: {person.vitals.hemoglobin}g/dL</span>}
                      </div>
                    )}
                  </div>

                  {/* Past Records Count & Referral Flag */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <ClipboardList className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{pVisits.length} Past Visits</span>
                      </span>

                      {pReferrals.length > 0 && (
                        <span className="flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          <GitPullRequest className="w-3 h-3" />
                          <span>{pReferrals[0].status}</span>
                        </span>
                      )}
                    </div>

                    <span>Last: {person.lastVisitDate || 'Recent'}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectModalPatient(person)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Past Records</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {onIssueReferral && hasHighPriority && (
                      <button
                        onClick={() => onIssueReferral(person)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                        title="Issue referral"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>Refer</span>
                      </button>
                    )}

                    <button
                      onClick={() => onStartVisit(person)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Mic className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Start Visit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Search Results State */
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No Beneficiaries Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              No registered records matched &ldquo;{searchQuery}&rdquo;. Try searching by name or household ID.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <button
              onClick={() => setSearchQuery('Kamal')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Search &ldquo;Kamal&rdquo;
            </button>
            <button
              onClick={() => setSearchQuery('Savita')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Search &ldquo;Savita&rdquo;
            </button>
            <button
              onClick={() => setSearchQuery('HH-01')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Search &ldquo;HH-01&rdquo;
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedHamlet('All');
                setSelectedPriority('All');
              }}
              className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: COMPREHENSIVE PATIENT PAST RECORDS & CLINICAL DOSSIER */}
      {/* ============================================================== */}
      {inspectModalPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={getPatientAvatar(inspectModalPatient.name, inspectModalPatient.gender)}
                  alt={inspectModalPatient.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {inspectModalPatient.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        inspectModalPatient.statusTag === 'High Priority'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : inspectModalPatient.statusTag === 'Follow Up'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {inspectModalPatient.statusTag || 'Routine'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {inspectModalPatient.age} yrs • {inspectModalPatient.gender} • Linked Household:{' '}
                    <span className="font-bold text-slate-800 font-mono">
                      {inspectModalPatient.householdId || 'HH-01'}
                    </span>{' '}
                    ({householdMap.get(inspectModalPatient.householdId)?.code || 'HH-PIP-001'})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectModalPatient(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Beneficiary Quick Stats Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Primary Condition</span>
                <span className="font-bold text-slate-900 truncate block">
                  {inspectModalPatient.condition}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-bold text-emerald-800 truncate block">
                  {inspectModalPatient.category}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Hamlet / Section</span>
                <span className="font-bold text-slate-800 truncate block">
                  {householdMap.get(inspectModalPatient.householdId)?.tola || 'Pipra Tola'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Phone Contact</span>
                <span className="font-mono font-bold text-slate-800 truncate block">
                  {inspectModalPatient.phone || '+91 98391 24510'}
                </span>
              </div>
            </div>

            {/* Past Visits Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-700" />
                  <span>Past Health Visits &amp; Clinical Notes ({visitsByPerson.get(inspectModalPatient.id)?.length || 1})</span>
                </h4>
              </div>

              <div className="space-y-2.5">
                {(visitsByPerson.get(inspectModalPatient.id) || [
                  {
                    id: 'VIS-SEED',
                    date: inspectModalPatient.lastVisitDate || '10 Oct 2026',
                    time: '10:15 AM',
                    condition: inspectModalPatient.condition,
                    symptoms: inspectModalPatient.symptoms,
                    vitals: inspectModalPatient.vitals,
                    notes: `Frontline health check recorded by ASHA worker. Follow-up scheduled under community protocol guidelines.`,
                    priorityLevel: inspectModalPatient.statusTag === 'High Priority' ? 'HIGH_PRIORITY' : 'ROUTINE',
                  },
                ]).map((vis: any, vIdx: number) => (
                  <div
                    key={vis.id || vIdx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-800">
                          {vis.date} {vis.time && `• ${vis.time}`}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          vis.priorityLevel === 'HIGH_PRIORITY'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {vis.priorityLevel || 'ROUTINE'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-700">Diagnosis:</span> {vis.condition}
                      </p>
                      {vis.symptoms && (
                        <p className="text-slate-600">
                          <span className="font-semibold text-slate-700">Symptoms:</span>{' '}
                          {Array.isArray(vis.symptoms) ? vis.symptoms.join(', ') : vis.symptoms}
                        </p>
                      )}
                      {vis.vitals && Object.keys(vis.vitals).length > 0 && (
                        <div className="flex gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                          {vis.vitals.bp && <span>BP: {vis.vitals.bp}</span>}
                          {vis.vitals.weightKg && <span>Weight: {vis.vitals.weightKg} kg</span>}
                          {vis.vitals.hemoglobin && <span>Hb: {vis.vitals.hemoglobin} g/dL</span>}
                          {vis.vitals.tempF && <span>Temp: {vis.vitals.tempF}°F</span>}
                        </div>
                      )}
                      {vis.notes && (
                        <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60 mt-1.5 text-[11px] leading-relaxed">
                          {vis.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past & Active Referrals */}
            {(referralsByPerson.get(inspectModalPatient.id) || []).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <GitPullRequest className="w-4 h-4 text-purple-700" />
                  <span>Referral Passports Issued</span>
                </h4>

                <div className="space-y-2">
                  {referralsByPerson.get(inspectModalPatient.id)!.map((ref: any) => (
                    <div
                      key={ref.id}
                      className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-950 font-mono">
                            {ref.referralCode}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {ref.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-900 mt-0.5">
                          Facility: {ref.referredToFacility} • Reason: {ref.reason}
                        </p>
                      </div>

                      <span className="text-[11px] text-purple-700 font-semibold">{ref.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Record</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const p = inspectModalPatient;
                    setInspectModalPatient(null);
                    onStartVisit(p);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Record New Visit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
